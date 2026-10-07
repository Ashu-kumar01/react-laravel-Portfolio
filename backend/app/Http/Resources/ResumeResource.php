<?php

namespace App\Http\Resources;

use App\Services\ResumeService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public resume metadata. Admin-only fields live in AdminResumeResource.
 *
 * @mixin \App\Models\Resume
 */
class ResumeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'file_name' => app(ResumeService::class)->downloadName($this->resource),
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'download_url' => route('api.v1.resume.download'),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
