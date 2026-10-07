<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(collect($this->only(['name', 'email', 'phone', 'subject', 'message']))
            ->map(fn ($v) => is_string($v) ? trim($v) : $v)
            ->all());
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'string', 'email:rfc', 'max:190'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^\+?[0-9\s\-()]{7,20}$/'],
            'subject' => ['required', 'string', 'min:3', 'max:190'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            // Honeypot: real users never see or fill this field.
            'website' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid phone number.',
            'message.min' => 'Please write at least :min characters so I can understand your enquiry.',
        ];
    }

    public function isSpam(): bool
    {
        return filled($this->input('website'));
    }
}
