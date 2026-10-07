<?php

namespace App\Models;

use App\Enums\TechnologyCategory;
use App\Enums\TechnologyLevel;
use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Technology extends Model
{
    use HasFactory, HasUniqueSlug;

    protected string $slugSource = 'name';

    protected $fillable = ['name', 'slug', 'category', 'proficiency', 'icon_path', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return [
            'category' => TechnologyCategory::class,
            'proficiency' => TechnologyLevel::class,
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return blank($term) ? $query : $query->where('name', 'like', '%'.addcslashes($term, '%_\\').'%');
    }
}
