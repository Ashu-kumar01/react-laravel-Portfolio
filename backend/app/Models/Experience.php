<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'company', 'position', 'location', 'employment_type', 'start_date', 'end_date',
        'is_current', 'description', 'responsibilities', 'technologies', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_current' => 'boolean',
            'responsibilities' => 'array',
            'technologies' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public const TYPES = ['work', 'education'];

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderByDesc('start_date');
    }
}
