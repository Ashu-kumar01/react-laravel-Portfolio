<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, HasUniqueSlug, SoftDeletes;

    protected string $slugSource = 'title';

    protected $fillable = [
        'title', 'slug', 'short_description', 'description', 'category', 'client', 'role',
        'technologies', 'features', 'featured_image', 'gallery', 'live_url', 'show_demo', 'github_url',
        'start_date', 'end_date', 'featured', 'status', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'technologies' => 'array',
            'features' => 'array',
            'gallery' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
            'featured' => 'boolean',
            'show_demo' => 'boolean',
            'status' => ProjectStatus::class,
            'sort_order' => 'integer',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ProjectStatus::Published);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderByDesc('id');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $like = '%'.addcslashes($term, '%_\\').'%';

        return $query->where(fn (Builder $q) => $q
            ->where('title', 'like', $like)
            ->orWhere('short_description', 'like', $like)
            ->orWhere('client', 'like', $like)
            ->orWhere('category', 'like', $like));
    }

    /**
     * Published projects that share the category or at least one technology.
     */
    public function related(int $limit = 3)
    {
        $techs = collect($this->technologies ?? [])->map(fn ($t) => mb_strtolower($t));

        return static::published()
            ->whereKeyNot($this->getKey())
            ->ordered()
            ->get()
            ->map(function (Project $p) use ($techs) {
                $shared = collect($p->technologies ?? [])->map(fn ($t) => mb_strtolower($t))->intersect($techs)->count();
                $p->relevance = $shared + ($p->category === $this->category ? 3 : 0);

                return $p;
            })
            ->filter(fn ($p) => $p->relevance > 0)
            ->sortByDesc('relevance')
            ->take($limit)
            ->values();
    }
}
