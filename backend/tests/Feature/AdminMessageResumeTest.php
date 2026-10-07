<?php

namespace Tests\Feature;

use App\Enums\MessageStatus;
use App\Models\ContactMessage;
use App\Models\Resume;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminMessageResumeTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_submission_appears_in_admin_and_status_workflow(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Rahul', 'email' => 'rahul@example.com', 'subject' => 'Hello',
            'message' => 'I need an admin panel built.',
        ])->assertCreated();

        $this->actingAsAdmin();

        $id = $this->getJson('/api/v1/admin/messages')
            ->assertOk()
            ->assertJsonPath('meta.counts.new', 1)
            ->assertJsonPath('data.0.subject', 'Hello')
            ->json('data.0.id');

        // Opening marks it read.
        $this->getJson("/api/v1/admin/messages/{$id}")->assertOk()->assertJsonPath('data.status', 'read');
        $this->assertNotNull(ContactMessage::query()->find($id)->read_at);

        $this->patchJson("/api/v1/admin/messages/{$id}/status", ['status' => 'new'])->assertJsonPath('data.status', 'new');
        $this->assertNull(ContactMessage::query()->find($id)->read_at);

        $this->patchJson("/api/v1/admin/messages/{$id}/status", ['status' => 'replied'])->assertJsonPath('data.status', 'replied');
        $this->assertNotNull(ContactMessage::query()->find($id)->replied_at);

        $this->patchJson("/api/v1/admin/messages/{$id}/status", ['status' => 'archived'])->assertJsonPath('data.status', 'archived');
        $this->patchJson("/api/v1/admin/messages/{$id}/status", ['status' => 'spam'])->assertUnprocessable();

        $this->deleteJson("/api/v1/admin/messages/{$id}")->assertOk();
        $this->assertSoftDeleted('contact_messages', ['id' => $id]);
    }

    public function test_message_filters_and_search(): void
    {
        $this->actingAsAdmin();
        ContactMessage::factory()->count(3)->create();
        ContactMessage::factory()->status(MessageStatus::Archived)->create(['subject' => 'Old archived thing']);
        ContactMessage::factory()->status(MessageStatus::Replied)->create();

        $this->getJson('/api/v1/admin/messages?status=new')->assertJsonPath('meta.pagination.total', 3);
        $this->getJson('/api/v1/admin/messages?status=archived')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/admin/messages?search=archived')->assertJsonPath('meta.pagination.total', 1);
        $this->getJson('/api/v1/admin/messages')->assertJsonPath('meta.counts.all', 5)->assertJsonPath('meta.counts.replied', 1);
    }

    public function test_resume_upload_replace_download_and_delete(): void
    {
        Storage::fake('local');
        $this->actingAsAdmin();

        $this->post('/api/v1/admin/resume', ['file' => $this->fakePdf('my cv.pdf'), 'title' => 'Resume 2026'], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Resume 2026');

        $first = Resume::query()->firstOrFail();
        Storage::disk('local')->assertExists($first->file_path);
        $this->assertStringStartsWith('resumes/', $first->file_path);

        // Replace: old record + file removed.
        $this->post('/api/v1/admin/resume', ['file' => $this->fakePdf('new.pdf')], ['Accept' => 'application/json'])->assertCreated();
        Storage::disk('local')->assertMissing($first->file_path);
        $this->assertSame(1, Resume::query()->count());

        // Public metadata + download (counted).
        $this->getJson('/api/v1/resume')
            ->assertOk()
            ->assertJsonPath('meta.available', true)
            ->assertJsonPath('data.download_url', route('api.v1.resume.download'))
            ->assertJsonMissingPath('data.download_count');

        $download = $this->get('/api/v1/resume/download');
        $download->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('attachment', $download->headers->get('Content-Disposition'));
        $this->assertSame(1, Resume::query()->first()->download_count);

        $this->getJson('/api/v1/admin/resume')->assertJsonPath('data.download_count', 1);
        $this->get('/api/v1/admin/resume/download')->assertOk();
        $this->assertSame(1, Resume::query()->first()->download_count);

        $path = Resume::query()->first()->file_path;
        $this->deleteJson('/api/v1/admin/resume')->assertOk();
        Storage::disk('local')->assertMissing($path);
        $this->getJson('/api/v1/resume')->assertJsonPath('meta.available', false);
        $this->deleteJson('/api/v1/admin/resume')->assertNotFound();
    }

    public function test_resume_upload_validation(): void
    {
        Storage::fake('local');
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/resume', [])->assertUnprocessable()->assertJsonValidationErrors('file');

        $this->post('/api/v1/admin/resume', ['file' => $this->fakePng('cv.png')], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('file');

        // Renamed executable content is rejected by MIME sniffing.
        $this->post('/api/v1/admin/resume', ['file' => $this->realUpload('cv.pdf', "MZ\x90\x00 fake windows executable")], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('file');

        $this->post('/api/v1/admin/resume', ['file' => UploadedFile::fake()->create('big.pdf', 6000, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('file');
    }
}
