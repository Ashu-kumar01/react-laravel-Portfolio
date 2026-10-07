<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Priya Sharma',
            'email' => 'Priya@Example.com',
            'phone' => '+91 98765 43210',
            'subject' => 'Project enquiry',
            'message' => 'Hi, I would like to discuss a Laravel project.',
        ], $overrides);
    }

    public function test_valid_message_is_stored(): void
    {
        $this->postJson('/api/v1/contact', $this->payload())
            ->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'priya@example.com',
            'subject' => 'Project enquiry',
            'status' => 'new',
        ]);
    }

    public function test_validation_errors_are_returned(): void
    {
        $this->postJson('/api/v1/contact', ['name' => 'A', 'email' => 'not-an-email', 'phone' => 'abc', 'message' => 'short'])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['name', 'email', 'phone', 'subject', 'message']);

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_html_is_stored_verbatim_not_executed(): void
    {
        $this->postJson('/api/v1/contact', $this->payload(['message' => '<script>alert(1)</script> hello there']))
            ->assertCreated();

        // Stored as plain text; the React UI renders it as text, never as HTML.
        $this->assertDatabaseHas('contact_messages', ['message' => '<script>alert(1)</script> hello there']);
    }

    public function test_honeypot_submissions_are_silently_discarded(): void
    {
        $this->postJson('/api/v1/contact', $this->payload(['website' => 'http://spam.example']))
            ->assertCreated();

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_contact_form_is_rate_limited(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/v1/contact', $this->payload())->assertCreated();
        }

        $this->postJson('/api/v1/contact', $this->payload())
            ->assertStatus(429)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('contact_messages', 3);
    }
}
