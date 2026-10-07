<?php

namespace App\Http\Requests\Concerns;

/** Shared upload validation: extension, real MIME type, size and dimensions. */
trait ImageRules
{
    protected function imageRules(?int $maxKb = null, string $dimensions = 'min_width=200,min_height=120,max_width=6000,max_height=6000'): array
    {
        return [
            'file',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'mimetypes:image/jpeg,image/png,image/webp',
            'max:'.($maxKb ?? config('portfolio.uploads.image_max_kb')),
            'dimensions:'.$dimensions,
        ];
    }
}
