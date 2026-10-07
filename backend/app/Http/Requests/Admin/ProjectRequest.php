<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProjectStatus;
use App\Http\Requests\Concerns\ImageRules;
use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Used for both create and update. On update every field is optional
 * ("sometimes") so the same endpoint supports partial PATCH requests such as
 * toggling `featured` or `status`.
 */
class ProjectRequest extends FormRequest
{
    use ImageRules;

    public function authorize(): bool
    {
        $project = $this->route('project');

        return $project instanceof Project
            ? $this->user()->can('update', $project)
            : $this->user()->can('create', Project::class);
    }

    public function rules(): array
    {
        $project = $this->route('project');
        $maxGallery = config('portfolio.uploads.gallery_max_items');

        $rules = [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', 'alpha_dash:ascii', Rule::unique('projects', 'slug')->ignore($project?->id)],
            'short_description' => ['required', 'string', 'max:300'],
            'description' => ['nullable', 'string', 'max:20000'],
            'category' => ['required', 'string', 'max:80'],
            'client' => ['nullable', 'string', 'max:160'],
            'role' => ['nullable', 'string', 'max:160'],
            'technologies' => ['nullable', 'array', 'max:30'],
            'technologies.*' => ['nullable', 'string', 'max:60'],
            'features' => ['nullable', 'array', 'max:30'],
            'features.*' => ['nullable', 'string', 'max:250'],
            'featured_image' => ['nullable', ...$this->imageRules(dimensions: 'min_width=400,min_height=225,max_width=6000,max_height=6000')],
            'remove_featured_image' => ['sometimes', 'boolean'],
            'gallery' => ['nullable', 'array', 'max:'.$maxGallery],
            'gallery.*' => $this->imageRules(),
            'keep_gallery' => ['nullable', 'array', 'max:'.$maxGallery],
            'keep_gallery.*' => ['nullable', 'string', 'max:255'],
            'live_url' => ['nullable', 'url:http,https', 'max:500'],
            'show_demo' => ['sometimes', 'boolean'],
            'github_url' => ['nullable', 'url:https', 'max:500'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'featured' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(ProjectStatus::values())],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
        ];

        if ($project instanceof Project) {
            foreach ($rules as $field => $fieldRules) {
                if (! str_contains($field, '.')) {
                    $rules[$field] = array_merge(['sometimes'], array_diff($fieldRules, ['sometimes']));
                }
            }
        }

        return $rules;
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $project = $this->route('project');
            $kept = $this->has('keep_gallery') ? count((array) $this->input('keep_gallery', [])) : count($project?->gallery ?? []);
            $total = $kept + count($this->file('gallery', []));

            if ($total > config('portfolio.uploads.gallery_max_items')) {
                $validator->errors()->add('gallery', 'A project can have at most '.config('portfolio.uploads.gallery_max_items').' gallery images.');
            }

            // "View demo" needs a link. Checked against the resulting state so partial updates work too.
            $showDemo = $this->has('show_demo') ? $this->boolean('show_demo') : (bool) $project?->show_demo;
            $liveUrl = $this->has('live_url') ? $this->input('live_url') : $project?->live_url;
            if ($showDemo && blank($liveUrl)) {
                $validator->errors()->add('live_url', 'Enter the demo link, or turn off "Show View demo".');
            }
        }];
    }

    public function messages(): array
    {
        return [
            'featured_image.dimensions' => 'The featured image must be at least 400×225 pixels.',
            'gallery.*.image' => 'Each gallery file must be an image (JPG, PNG or WebP).',
            'gallery.*.max' => 'Each gallery image may not be larger than :max KB.',
            'end_date.after_or_equal' => 'The end date must be on or after the start date.',
        ];
    }
}
