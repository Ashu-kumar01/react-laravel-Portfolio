<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Concerns\ImageRules;
use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Foundation\Http\FormRequest;

/** Upload for an image setting (hero portrait, social share image). Dimensions come from config. */
class SettingImageRequest extends FormRequest
{
    use ImageRules;

    public function authorize(): bool
    {
        return $this->user()->can('update', Setting::class);
    }

    protected function prepareForValidation(): void
    {
        // Unknown keys are a 404 before any validation runs.
        abort_unless(in_array($this->route('key'), app(SettingService::class)->imageKeys(), true), 404, 'Unknown image setting.');
    }

    public function rules(): array
    {
        return [
            'image' => ['required', ...$this->imageRules(dimensions: $this->dimensions())],
        ];
    }

    public function messages(): array
    {
        parse_str(str_replace(',', '&', $this->dimensions()), $d);
        $actual = '';
        if ($this->file('image') && ($size = @getimagesize($this->file('image')->getRealPath()))) {
            $actual = " Yours is {$size[0]}×{$size[1]} px.";
        }

        return [
            'image.dimensions' => "The image must be at least {$d['min_width']}×{$d['min_height']} px and at most {$d['max_width']}×{$d['max_height']} px.{$actual}",
        ];
    }

    private function dimensions(): string
    {
        return config('portfolio.settings.'.$this->route('key').'.dimensions', 'min_width=200,min_height=200,max_width=6000,max_height=6000');
    }
}
