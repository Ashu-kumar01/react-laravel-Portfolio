<?php

namespace App\Http\Resources;

use App\Services\FileStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Project */
class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'category' => $this->category,
            'client' => $this->client,
            'role' => $this->role,
            'technologies' => $this->technologies ?? [],
            'features' => $this->features ?? [],
            'featured_image' => FileStorageService::url($this->featured_image),
            'gallery' => collect($this->gallery ?? [])->map(fn (string $path) => [
                'path' => $path,
                'url' => FileStorageService::url($path),
            ])->values(),
            // The public API only exposes the demo link when "View demo" is switched on; admins always see it.
            'live_url' => $this->show_demo || $request->routeIs('api.v1.admin.*') ? $this->live_url : null,
            'show_demo' => (bool) $this->show_demo,
            'github_url' => $this->github_url,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'featured' => $this->featured,
            'status' => $this->status?->value,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
