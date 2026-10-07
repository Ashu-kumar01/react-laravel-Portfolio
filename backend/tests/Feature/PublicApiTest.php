<?php

namespace Tests\Feature;

use App\Models\Experience;
use App\Models\Project;
use App\Models\Service;
use App\Models\Technology;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_reports_status(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJsonPath('data.status', 'operational')
            ->assertJsonPath('data.database', 'ok');
    }

    public function test_profile_returns_public_settings_stats_and_no_private_keys(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->getJson('/api/v1/profile')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.profile.full_name', 'Ashwani Kumar Kushwaha')
            ->assertJsonPath('data.profile.title', 'Frontend & PHP/Laravel Developer')
            ->assertJsonPath('data.stats.projects', 7)
            ->assertJsonPath('data.stats.technologies', 28)
            ->assertJsonPath('data.stats.years_experience', 3.8)
            ->assertJsonPath('data.stats.websites', 30)
            ->assertJsonPath('data.resume', null)
            ->assertJsonMissingPath('data.profile.notification_email');
    }

    public function test_seeded_content_matches_brief(): void
    {
        $this->seed(DatabaseSeeder::class);

        $titles = collect($this->getJson('/api/v1/projects?per_page=50')->json('data'))->pluck('title');
        foreach ([
            'OpenCompas Educational ERP', 'The Great India Raipur Website', 'Shri Rawatpura Sarkar University Website',
            'Munchhonn Website', 'MAIC College Website', 'Fuel Save Website', 'Hexa Jobs Website',
        ] as $title) {
            $this->assertContains($title, $titles);
        }

        $this->assertCount(9, $this->getJson('/api/v1/services')->json('data'));

        // No percentages: skills use honest levels.
        $levels = collect($this->getJson('/api/v1/technologies')->json('data'))->pluck('proficiency')->unique()->sort()->values()->all();
        $this->assertSame(['advanced', 'intermediate', 'learning'], $levels);

        $experience = collect($this->getJson('/api/v1/experience')->json('data'));
        $this->assertSame(1, $experience->where('type', 'work')->count());
        $this->assertTrue($experience->where('type', 'education')->pluck('position')->contains('B.Tech — Computer Science Engineering'));
    }

    public function test_projects_index_only_lists_published_with_envelope_and_pagination(): void
    {
        Project::factory()->count(3)->create(['category' => 'Business']);
        Project::factory()->featured()->create(['category' => 'Education']);
        Project::factory()->draft()->create();

        $this->getJson('/api/v1/projects')
            ->assertOk()
            ->assertJsonStructure([
                'success', 'message',
                'data' => [['id', 'title', 'slug', 'short_description', 'technologies', 'featured_image', 'gallery', 'featured']],
                'meta' => ['pagination' => ['current_page', 'last_page', 'per_page', 'total'], 'categories'],
            ])
            ->assertJsonPath('meta.pagination.total', 4)
            ->assertJsonCount(2, 'meta.categories');

        $this->getJson('/api/v1/projects?featured=1')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/projects?category=Business')->assertJsonPath('meta.pagination.total', 3);
        $this->getJson('/api/v1/projects?per_page=2')->assertJsonCount(2, 'data')->assertJsonPath('meta.pagination.last_page', 2);
        $this->getJson('/api/v1/projects?per_page=999')->assertUnprocessable();
    }

    public function test_project_detail_by_slug_with_related_projects(): void
    {
        $project = Project::factory()->create(['title' => 'Main Project', 'category' => 'Education', 'technologies' => ['Laravel']]);
        Project::factory()->create(['category' => 'Education']);
        Project::factory()->create(['category' => 'Other', 'technologies' => ['Laravel']]);
        Project::factory()->create(['category' => 'Other', 'technologies' => ['Go']]);

        $this->getJson('/api/v1/projects/'.$project->slug)
            ->assertOk()
            ->assertJsonPath('data.title', 'Main Project')
            ->assertJsonPath('data.slug', 'main-project')
            ->assertJsonCount(2, 'meta.related');
    }

    public function test_draft_and_missing_projects_return_404(): void
    {
        $draft = Project::factory()->draft()->create();

        $this->getJson('/api/v1/projects/'.$draft->slug)->assertNotFound()->assertJsonPath('success', false);
        $this->getJson('/api/v1/projects/does-not-exist')->assertNotFound();
    }

    public function test_technologies_only_active_with_categories(): void
    {
        Technology::factory()->count(2)->create(['category' => 'backend']);
        Technology::factory()->create(['category' => 'frontend']);
        Technology::factory()->inactive()->create(['category' => 'design']);

        $this->getJson('/api/v1/technologies')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonCount(2, 'meta.categories');
    }

    public function test_experience_and_services_endpoints(): void
    {
        Experience::factory()->count(2)->create();
        Service::factory()->count(2)->create();
        Service::factory()->inactive()->create();

        $this->getJson('/api/v1/experience')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/services')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_resume_endpoints_when_no_resume_exists(): void
    {
        $this->getJson('/api/v1/resume')->assertOk()->assertJsonPath('meta.available', false);
        $this->get('/api/v1/resume/download')->assertNotFound()->assertJsonPath('success', false);
    }

    public function test_unknown_endpoints_and_methods_return_json_errors(): void
    {
        $this->getJson('/api/v1/unknown')->assertNotFound()->assertJsonPath('success', false);
        $this->deleteJson('/api/v1/projects')->assertStatus(405)->assertJsonPath('success', false);
    }

    public function test_security_headers_are_present(): void
    {
        $this->getJson('/api/v1/health')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }
}
