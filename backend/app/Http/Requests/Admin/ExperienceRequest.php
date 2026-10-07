<?php

namespace App\Http\Requests\Admin;

use App\Models\Experience;
use App\Support\ListInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $experience = $this->route('experience');

        return $experience instanceof Experience
            ? $this->user()->can('update', $experience)
            : $this->user()->can('create', Experience::class);
    }

    public function rules(): array
    {
        $required = $this->route('experience') instanceof Experience ? 'sometimes' : 'required';

        return [
            'type' => ['sometimes', Rule::in(Experience::TYPES)],
            'company' => [$required, 'string', 'max:160'],
            'position' => [$required, 'string', 'max:160'],
            'location' => ['nullable', 'string', 'max:160'],
            'employment_type' => ['nullable', 'string', 'max:40'],
            'start_date' => [$required, 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_current' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string', 'max:3000'],
            'responsibilities' => ['nullable', 'array', 'max:20'],
            'responsibilities.*' => ['nullable', 'string', 'max:300'],
            'technologies' => ['nullable', 'array', 'max:30'],
            'technologies.*' => ['nullable', 'string', 'max:60'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
        ];
    }

    /** Normalised payload: list fields trimmed, current roles have no end date. */
    public function payload(): array
    {
        $data = $this->validated();

        $data = ListInput::cleanKeys($data, ['responsibilities', 'technologies']);

        if (! empty($data['is_current'])) {
            $data['end_date'] = null;
        }

        return $data;
    }
}
