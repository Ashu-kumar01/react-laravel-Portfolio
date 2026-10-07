<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Experience */
class ExperienceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'company' => $this->company,
            'position' => $this->position,
            'location' => $this->location,
            'employment_type' => $this->employment_type,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->is_current ? null : $this->end_date?->toDateString(),
            'is_current' => $this->is_current,
            'description' => $this->description,
            'responsibilities' => $this->responsibilities ?? [],
            'technologies' => $this->technologies ?? [],
            'sort_order' => $this->sort_order,
        ];
    }
}
