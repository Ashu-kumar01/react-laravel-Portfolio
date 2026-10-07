<?php

namespace Tests\Feature;

use App\Models\Experience;
use App\Models\Service;
use App\Models\Technology;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** CRUD for technologies, experience, services and settings. */
class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->actingAsAdmin();
    }

    public function test_technology_crud_with_icon(): void
    {
        $id = $this->post('/api/v1/admin/technologies', [
            'name' => 'Livewire',
            'category' => 'backend',
            'proficiency' => 'intermediate',
            'sort_order' => 4,
            'is_active' => '1',
            'icon' => $this->fakePng('icon.png', 64, 64),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'livewire')
            ->assertJsonPath('data.category', 'backend')
            ->json('data.id');

        $icon = Technology::query()->find($id)->icon_path;
        Storage::disk('public')->assertExists($icon);
        $this->getJson('/api/v1/technologies')->assertJsonFragment(['name' => 'Livewire']);

        // Change category, proficiency, order; disable; remove icon.
        $this->post("/api/v1/admin/technologies/{$id}", [
            '_method' => 'PUT', 'name' => 'Livewire 3', 'category' => 'frontend', 'proficiency' => 'advanced',
            'sort_order' => 1, 'is_active' => '0', 'remove_icon' => '1',
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.category', 'frontend')
            ->assertJsonPath('data.proficiency', 'advanced')
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.icon_url', null);

        Storage::disk('public')->assertMissing($icon);
        $this->getJson('/api/v1/technologies')->assertJsonMissing(['name' => 'Livewire 3']);

        $this->getJson('/api/v1/admin/technologies?category=frontend&active=0')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/admin/technologies?search=Live')->assertJsonPath('meta.pagination.total', 1);

        $this->deleteJson("/api/v1/admin/technologies/{$id}")->assertOk();
        $this->assertDatabaseMissing('technologies', ['id' => $id]);
    }

    public function test_technology_validation(): void
    {
        Technology::factory()->create(['name' => 'PHP']);

        $this->postJson('/api/v1/admin/technologies', ['name' => 'PHP', 'category' => 'cooking', 'proficiency' => 95])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'category', 'proficiency']);

        $this->post('/api/v1/admin/technologies', [
            'name' => 'SVG Thing', 'category' => 'tools', 'proficiency' => 'learning',
            'icon' => UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('icon');
    }

    public function test_experience_crud(): void
    {
        $id = $this->postJson('/api/v1/admin/experiences', [
            'type' => 'work',
            'company' => 'Example Co',
            'position' => 'Laravel Developer',
            'start_date' => '2023-02-01',
            'end_date' => '2024-03-01',
            'description' => 'Built APIs.',
            'responsibilities' => ['APIs', '', 'Admin panels'],
            'technologies' => ['Laravel'],
            'sort_order' => 2,
        ])->assertCreated()
            ->assertJsonPath('data.responsibilities', ['APIs', 'Admin panels'])
            ->json('data.id');

        $this->putJson("/api/v1/admin/experiences/{$id}", ['position' => 'Senior Laravel Developer', 'is_current' => true, 'end_date' => '2025-01-01'])
            ->assertOk()
            ->assertJsonPath('data.position', 'Senior Laravel Developer')
            ->assertJsonPath('data.is_current', true)
            ->assertJsonPath('data.end_date', null);

        $this->postJson('/api/v1/admin/experiences', ['company' => '', 'start_date' => 'nope'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['company', 'position', 'start_date']);

        $this->getJson('/api/v1/admin/experiences')->assertJsonPath('meta.pagination.total', 1);
        $this->postJson('/api/v1/admin/experiences', ['type' => 'hobby', 'company' => 'X', 'position' => 'Y', 'start_date' => '2020-01-01'])->assertUnprocessable()->assertJsonValidationErrors('type');
        $this->postJson('/api/v1/admin/experiences', ['type' => 'education', 'company' => 'College', 'position' => 'B.Tech', 'start_date' => '2018-01-01', 'end_date' => '2022-01-01'])->assertCreated()->assertJsonPath('data.type', 'education');
        $this->getJson('/api/v1/admin/experiences?type=education')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/admin/experiences?type=work')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/experience')->assertJsonCount(2, 'data');

        $this->deleteJson("/api/v1/admin/experiences/{$id}")->assertOk();
        $this->assertSame(1, Experience::query()->count());
    }

    public function test_service_crud_and_active_toggle(): void
    {
        $id = $this->postJson('/api/v1/admin/services', [
            'title' => 'Performance Audits',
            'short_description' => 'Find and fix bottlenecks.',
            'icon' => 'zap',
            'features' => ['Profiling'],
            'is_active' => true,
        ])->assertCreated()->assertJsonPath('data.slug', 'performance-audits')->json('data.id');

        $this->getJson('/api/v1/services')->assertJsonFragment(['title' => 'Performance Audits']);

        $this->patchJson("/api/v1/admin/services/{$id}", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->getJson('/api/v1/services')->assertJsonMissing(['title' => 'Performance Audits']);

        $this->postJson('/api/v1/admin/services', ['title' => 'X', 'short_description' => 'Y', 'icon' => 'javascript:alert(1)'])
            ->assertUnprocessable()->assertJsonValidationErrors('icon');

        $this->deleteJson("/api/v1/admin/services/{$id}")->assertOk();
        $this->assertSame(0, Service::query()->count());
    }

    public function test_settings_read_update_and_validation(): void
    {
        $this->getJson('/api/v1/admin/settings')->assertOk()->assertJsonStructure(['data' => ['full_name', 'github_url', 'notification_email'], 'meta' => ['groups']]);

        $this->putJson('/api/v1/admin/settings', ['github_url' => 'javascript:alert(1)', 'email' => 'bad'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['github_url', 'email']);

        $this->putJson('/api/v1/admin/settings', [
            'full_name' => 'Ashwani Kumar Kushwaha',
            'display_name' => 'Ashwani Kushwaha',
            'title' => 'Full-Stack Developer',
            'github_url' => 'https://github.com/example',
            'notification_email' => 'private@example.com',
            'unknown_key' => 'ignored',
        ])->assertOk()->assertJsonPath('data.github_url', 'https://github.com/example');

        $this->assertDatabaseMissing('settings', ['key' => 'unknown_key']);
        $this->getJson('/api/v1/profile')
            ->assertJsonPath('data.profile.github_url', 'https://github.com/example')
            ->assertJsonMissingPath('data.profile.notification_email');
    }

    public function test_dashboard_summary(): void
    {
        Technology::factory()->count(3)->create();

        $this->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.technologies', 3)
            ->assertJsonStructure([
                'data' => [
                    'stats' => ['projects', 'featured_projects', 'technologies', 'experiences', 'messages', 'unread_messages'],
                    'charts' => ['messages_per_month', 'messages_by_status', 'technologies_by_category', 'projects_by_category'],
                    'recent_messages',
                ],
            ])
            ->assertJsonCount(6, 'data.charts.messages_per_month');
    }
}
