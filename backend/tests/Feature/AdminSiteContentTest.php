<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Landing section, SEO settings (JSON + image settings) and the project "View demo" toggle. */
class AdminSiteContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->actingAsAdmin();
    }

    public function test_landing_badges_are_saved_as_json_and_published(): void
    {
        $this->putJson('/api/v1/admin/settings', [
            'hero_name' => 'Ashwani Kumar',
            'hero_badges' => [['label' => 'React.js', 'icon' => 'react'], ['label' => 'Laravel', 'icon' => null]],
            'hero_floating_badges' => [['value' => '4+', 'label' => 'Years of experience'], ['value' => null, 'label' => 'Open to work']],
            'hero_tech_bubbles' => ['react', 'php'],
            'meta_keywords' => 'Laravel, React',
            'twitter_handle' => '@ashwani_dev',
        ])
            ->assertOk()
            ->assertJsonPath('data.hero_badges.0.label', 'React.js')
            ->assertJsonPath('data.hero_floating_badges.0.value', '4+')
            ->assertJsonPath('data.hero_tech_bubbles', ['react', 'php']);

        $this->getJson('/api/v1/profile')
            ->assertJsonPath('data.profile.hero_name', 'Ashwani Kumar')
            ->assertJsonPath('data.profile.hero_badges.1.label', 'Laravel')
            ->assertJsonPath('data.profile.hero_floating_badges.1.label', 'Open to work')
            ->assertJsonPath('data.profile.meta_keywords', 'Laravel, React')
            ->assertJsonPath('data.profile.hero_image', null);

        // Clearing a list stores null.
        $this->putJson('/api/v1/admin/settings', ['hero_tech_bubbles' => null])->assertOk()->assertJsonPath('data.hero_tech_bubbles', null);
    }

    public function test_landing_badge_validation(): void
    {
        $this->putJson('/api/v1/admin/settings', [
            'hero_badges' => [['label' => '', 'icon' => 'bad icon!'], ['label' => 'X', 'extra' => 'nope']],
            'hero_floating_badges' => array_fill(0, 5, ['value' => '1', 'label' => 'Too many']),
            'hero_tech_bubbles' => ['<script>'],
            'twitter_handle' => 'not a handle',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'hero_badges.0.label', 'hero_badges.0.icon', 'hero_badges.1', 'hero_floating_badges', 'hero_tech_bubbles.0', 'twitter_handle',
            ]);

        // Image settings cannot be written through the JSON endpoint.
        $this->putJson('/api/v1/admin/settings', ['hero_image' => 'settings/evil.png'])->assertOk()->assertJsonPath('data.hero_image', null);
    }

    public function test_hero_and_social_images_upload_replace_and_remove(): void
    {
        $first = $this->post('/api/v1/admin/settings/images/hero_image', ['image' => $this->fakePng('me.png', 600, 600)], ['Accept' => 'application/json'])
            ->assertOk()
            ->json('data.hero_image');
        $this->assertStringContainsString('/storage/settings/', $first);
        $firstPath = 'settings/'.basename($first);
        Storage::disk('public')->assertExists($firstPath);

        $this->getJson('/api/v1/profile')->assertJsonPath('data.profile.hero_image', $first);

        // Replacing deletes the old file.
        $second = $this->post('/api/v1/admin/settings/images/hero_image', ['image' => $this->fakePng('me2.png', 800, 800)], ['Accept' => 'application/json'])
            ->assertOk()
            ->json('data.hero_image');
        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($firstPath);

        $this->deleteJson('/api/v1/admin/settings/images/hero_image')->assertOk()->assertJsonPath('data.hero_image', null);
        Storage::disk('public')->assertMissing('settings/'.basename($second));

        // A small 200×200 cut-out is accepted; anything smaller gets a message with the actual size.
        $this->post('/api/v1/admin/settings/images/hero_image', ['image' => $this->fakePng('small.png', 200, 200)], ['Accept' => 'application/json'])->assertOk();
        $this->post('/api/v1/admin/settings/images/hero_image', ['image' => $this->fakePng('tiny.png', 150, 150)], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.image.0', 'The image must be at least 200×200 px and at most 6000×6000 px. Yours is 150×150 px.');

        // Social image needs at least 600×315; too small is rejected.
        $this->post('/api/v1/admin/settings/images/og_image', ['image' => $this->fakePng('og.png', 300, 200)], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);
        $this->post('/api/v1/admin/settings/images/og_image', ['image' => $this->fakePng('og.png', 1200, 630)], ['Accept' => 'application/json'])
            ->assertOk();
        $this->getJson('/api/v1/profile')->assertJsonPath('data.profile.og_image', fn ($url) => str_contains((string) $url, '/storage/settings/'));

        // Only configured image keys are accepted.
        $this->post('/api/v1/admin/settings/images/full_name', ['image' => $this->fakePng('x.png', 600, 600)], ['Accept' => 'application/json'])->assertNotFound();
        $this->deleteJson('/api/v1/admin/settings/images/unknown')->assertNotFound();
    }

    public function test_view_demo_toggle_controls_the_public_link(): void
    {
        $project = Project::factory()->create(['status' => 'published', 'live_url' => 'https://demo.example.com', 'show_demo' => false]);

        $this->getJson("/api/v1/projects/{$project->slug}")->assertJsonPath('data.live_url', null)->assertJsonPath('data.show_demo', false);
        $this->getJson("/api/v1/admin/projects/{$project->id}")->assertJsonPath('data.live_url', 'https://demo.example.com');

        // Turning it on with the existing link works (partial update).
        $this->patchJson("/api/v1/admin/projects/{$project->id}", ['show_demo' => true])->assertOk()->assertJsonPath('data.show_demo', true);
        $this->getJson("/api/v1/projects/{$project->slug}")->assertJsonPath('data.live_url', 'https://demo.example.com');

        // "View demo" on without a link is rejected.
        $this->patchJson("/api/v1/admin/projects/{$project->id}", ['live_url' => ''])->assertUnprocessable()->assertJsonValidationErrors(['live_url']);
        $this->patchJson("/api/v1/admin/projects/{$project->id}", ['show_demo' => false, 'live_url' => ''])->assertOk()->assertJsonPath('data.show_demo', false);
    }
}
