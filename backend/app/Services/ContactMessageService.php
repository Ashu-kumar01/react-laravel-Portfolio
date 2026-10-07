<?php

namespace App\Services;

use App\Enums\MessageStatus;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ContactMessageService
{
    public function __construct(private readonly SettingService $settings) {}

    public function store(array $data, Request $request): ContactMessage
    {
        $message = ContactMessage::query()->create([
            'name' => $data['name'],
            'email' => Str::lower($data['email']),
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => MessageStatus::New,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 490, ''),
        ]);

        Log::info('New contact enquiry received', ['id' => $message->id]);
        $this->notify($message);

        return $message;
    }

    /** Emails a short notice to the private notification address, if configured. */
    private function notify(ContactMessage $message): void
    {
        $to = $this->settings->get('notification_email');
        if (blank($to)) {
            return;
        }

        try {
            Mail::raw(
                "New enquiry from {$message->name} <{$message->email}>\n\nSubject: {$message->subject}\n\n{$message->message}",
                fn ($mail) => $mail->to($to)->replyTo($message->email, $message->name)->subject('New portfolio enquiry: '.Str::limit($message->subject, 80)),
            );
        } catch (\Throwable $e) {
            // The enquiry is already stored; a mail failure must not fail the request.
            Log::warning('Contact notification email failed', ['id' => $message->id, 'error' => $e->getMessage()]);
        }
    }

    public function counts(): array
    {
        $counts = ContactMessage::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $result = ['all' => (int) $counts->sum()];
        foreach (MessageStatus::values() as $status) {
            $result[$status] = (int) ($counts[$status] ?? 0);
        }

        return $result;
    }
}
