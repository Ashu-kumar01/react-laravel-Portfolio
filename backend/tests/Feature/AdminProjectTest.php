<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminProjectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->actingAsAdmin();
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Inventory Platform',
            'short_description' => 'A Laravel inventory platform.',
            'description' => 'Longer description.',
            'category' => 'Web Application',
            'client' => 'Acme',
            'role' => 'Full-Stack Developer',
            'technologies' => ['Laravel', 'MySQL', ' '],
            'features' => ['Stock tracking'],
            'live_url' => 'https://example.com',
            'start_date' => '2024-01-01',
            'end_date' => '2024-06-30',
            'featured' => '1',
            'status' => 'published',
            'sort_order' => 3,
        ], $overrides);
    }

    public function test_create_project_with_featured_image_and_gallery(): void
    {
        $response = $this->post('/api/v1/admin/projects', $this->validPayload([
            'featured_image' => $this->fakePng('cover.png', 1200, 675),
            'gallery' => [$this->fakePng('g1.png', 800, 500), $this->fakePng('g2.png', 800, 500)],
        ]), ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('data.slug', 'inventory-platform')
            ->assertJsonPath('data.featured', true)
            ->assertJsonPath('data.technologies', ['Laravel', 'MySQL'])
            ->assertJsonCount(2, 'data.gallery');

        $project = Project::query()->firstOrFail();
        Storage::disk('public')->assertExists($project->featured_image);
        foreach ($project->gallery as $path) {
            Storage::disk('public')->assertExists($path);
        }
        // Server-generated names, never the client file name.
        $this->assertStringNotContainsString('cover', $project->featured_image);
    }

    public function test_validation_errors_on_create(): void
    {
        $this->postJson('/api/v1/admin/projects', ['title' => '', 'status' => 'unknown', 'live_url' => 'not-a-url', 'start_date' => '2024-05-01', 'end_date' => '2024-01-01'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'short_description', 'category', 'status', 'live_url', 'end_date']);
    }

    public function test_rejects_non_images_and_disguised_files(): void
    {
        $this->post('/api/v1/admin/projects', $this->validPayload([
            'featured_image' => $this->realUpload('shell.png', '<?php echo "pwned"; ?>'),
        ]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('featured_image');

        $this->post('/api/v1/admin/projects', $this->validPayload([
            'featured_image' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('featured_image');

        // Too small for a featured image.
        $this->post('/api/v1/admin/projects', $this->validPayload([
            'featured_image' => $this->fakePng('tiny.png', 50, 50),
        ]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('featured_image');

        $this->assertDatabaseCount('projects', 0);
    }

    public function test_slug_must_be_unique(): void
    {
        Project::factory()->create(['slug' => 'taken-slug']);

        $this->postJson('/api/v1/admin/projects', $this->validPayload(['slug' => 'taken-slug']))
            ->assertUnprocessable()->assertJsonValidationErrors('slug');

        // Auto-generated slugs are de-duplicated.
        Project::factory()->create(['title' => 'Inventory Platform']);
        $this->postJson('/api/v1/admin/projects', $this->validPayload())->assertCreated()->assertJsonPath('data.slug', 'inventory-platform-2');
    }

    public function test_index_search_filter_and_pagination(): void
    {
        Project::factory()->count(12)->create(['category' => 'Business']);
        Project::factory()->draft()->create(['title' => 'Secret Draft Portal', 'category' => 'Education']);
        Project::factory()->featured()->create(['category' => 'Education']);

        $this->getJson('/api/v1/admin/projects')
            ->assertOk()
            ->assertJsonPath('meta.pagination.total', 14)
            ->assertJsonPath('meta.pagination.per_page', 10)
            ->assertJsonCount(10, 'data');

        $this->getJson('/api/v1/admin/projects?page=2')->assertJsonCount(4, 'data');
        $this->getJson('/api/v1/admin/projects?search=Secret%20Draft')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/admin/projects?status=draft')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/admin/projects?category=Education')->assertJsonPath('meta.pagination.total', 2);
        $this->getJson('/api/v1/admin/projects?featured=1')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/admin/projects?sort=title&direction=asc')->assertOk();
        $this->getJson('/api/v1/admin/projects?sort=password')->assertUnprocessable();
    }

    public function test_update_project_fields_and_replace_image(): void
    {
        $project = $this->post('/api/v1/admin/projects', $this->validPayload([
            'featured_image' => $this->fakePng('cover.png', 1200, 675),
        ]), ['Accept' => 'application/json'])->json('data');

        $oldPath = Project::query()->find($project['id'])->featured_image;

        $this->post("/api/v1/admin/projects/{$project['id']}", $this->validPayload([
            '_method' => 'PUT',
            'title' => 'Inventory Platform v2',
            'featured_image' => $this->fakePng('new.png', 1200, 675),
        ]), ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Inventory Platform v2')
            ->assertJsonPath('data.slug', 'inventory-platform');

        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists(Project::query()->find($project['id'])->featured_image);
    }

    public function test_gallery_keep_and_remove_only_allows_existing_paths(): void
    {
        $id = $this->post('/api/v1/admin/projects', $this->validPayload([
            'gallery' => [$this->fakePng('a.png'), $this->fakePng('b.png')],
        ]), ['Accept' => 'application/json'])->json('data.id');

        [$keep, $remove] = Project::query()->find($id)->gallery;

        $this->post("/api/v1/admin/projects/{$id}", [
            '_method' => 'PATCH',
            'keep_gallery' => [$keep, '../../.env'],
            'gallery' => [$this->fakePng('c.png')],
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonCount(2, 'data.gallery');

        $gallery = Project::query()->find($id)->gallery;
        $this->assertContains($keep, $gallery);
        $this->assertNotContains('../../.env', $gallery);
        Storage::disk('public')->assertMissing($remove);
    }

    public function test_appending_gallery_images_without_keep_list_preserves_existing(): void
    {
        $id = $this->post('/api/v1/admin/projects', $this->validPayload([
            'gallery' => [$this->fakePng('a.png')],
        ]), ['Accept' => 'application/json'])->json('data.id');

        $this->post("/api/v1/admin/projects/{$id}", ['_method' => 'PATCH', 'gallery' => [$this->fakePng('b.png')]], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonCount(2, 'data.gallery');
    }

    public function test_toggle_featured_and_publish_unpublish_with_partial_update(): void
    {
        $project = Project::factory()->create(['featured' => false]);

        $this->patchJson("/api/v1/admin/projects/{$project->id}", ['featured' => true])
            ->assertOk()->assertJsonPath('data.featured', true);

        $this->patchJson("/api/v1/admin/projects/{$project->id}", ['status' => 'draft'])
            ->assertOk()->assertJsonPath('data.status', 'draft');
        $this->getJson('/api/v1/projects/'.$project->slug)->assertNotFound();

        $this->patchJson("/api/v1/admin/projects/{$project->id}", ['status' => 'published'])->assertOk();
        $this->getJson('/api/v1/projects/'.$project->slug)->assertOk();

        $this->patchJson("/api/v1/admin/projects/{$project->id}", ['sort_order' => 99])->assertJsonPath('data.sort_order', 99);
    }

    public function test_show_and_delete_project(): void
    {
        $project = Project::factory()->create();

        $this->getJson("/api/v1/admin/projects/{$project->id}")->assertOk()->assertJsonPath('data.id', $project->id);
        $this->deleteJson("/api/v1/admin/projects/{$project->id}")->assertOk();

        $this->assertSoftDeleted($project);
        $this->getJson("/api/v1/admin/projects/{$project->id}")->assertNotFound();
        $this->getJson('/api/v1/projects/'.$project->slug)->assertNotFound();
    }
}
