<?php

namespace App\Http\Requests\Admin;

use App\Models\Resume;
use Illuminate\Foundation\Http\FormRequest;

class ResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Resume::class);
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf', 'mimetypes:application/pdf', 'max:'.config('portfolio.uploads.resume_max_kb')],
            'title' => ['nullable', 'string', 'max:160'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'The resume must be a PDF file.',
            'file.mimetypes' => 'The resume must be a valid PDF document.',
            'file.max' => 'The resume may not be larger than 5 MB.',
        ];
    }
}
