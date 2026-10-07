<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/** @mixin \App\Models\Resume */
class AdminResumeResource extends ResumeResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'original_name' => $this->original_name,
            'download_count' => $this->download_count,
            'admin_download_url' => route('api.v1.admin.resume.download'),
            'created_at' => $this->created_at?->toIso8601String(),
        ]);
    }
}
