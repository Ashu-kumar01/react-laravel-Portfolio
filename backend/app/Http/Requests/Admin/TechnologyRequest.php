<?php

namespace App\Http\Requests\Admin;

use App\Enums\TechnologyCategory;
use App\Enums\TechnologyLevel;
use App\Http\Requests\Concerns\ImageRules;
use App\Models\Technology;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TechnologyRequest extends FormRequest
{
    use ImageRules;

    public function authorize(): bool
    {
        $technology = $this->route('technology');

        return $technology instanceof Technology
            ? $this->user()->can('update', $technology)
            : $this->user()->can('create', Technology::class);
    }

    public function rules(): array
    {
        $technology = $this->route('technology');
        $required = $technology instanceof Technology ? 'sometimes' : 'required';

        return [
            'name' => [$required, 'string', 'max:80', Rule::unique('technologies', 'name')->ignore($technology?->id)],
            'category' => [$required, Rule::enum(TechnologyCategory::class)],
            'proficiency' => [$required, Rule::enum(TechnologyLevel::class)],
            'icon' => ['nullable', ...$this->imageRules(config('portfolio.uploads.icon_max_kb'), 'min_width=16,min_height=16,max_width=1024,max_height=1024')],
            'remove_icon' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
