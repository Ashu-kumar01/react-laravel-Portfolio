<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Generates a unique slug from a source attribute when none is provided.
 * Models declare `protected string $slugSource = 'title';`.
 */
trait HasUniqueSlug
{
    protected static function bootHasUniqueSlug(): void
    {
        static::saving(function ($model) {
            $source = $model->slugSource ?? 'title';

            // Slugs are stable once set (good for SEO); they only change when edited explicitly.
            if (blank($model->slug)) {
                $model->slug = $model->generateUniqueSlug((string) $model->{$source});
            } elseif ($model->isDirty('slug')) {
                $model->slug = $model->generateUniqueSlug($model->slug);
            }
        });
    }

    public function generateUniqueSlug(string $value): string
    {
        $base = Str::slug($value) ?: Str::lower(Str::random(8));
        $slug = $base;
        $i = 2;

        $query = fn (string $candidate) => static::query()
            ->when(method_exists($this, 'bootSoftDeletes'), fn ($q) => $q->withTrashed())
            ->where('slug', $candidate)
            ->when($this->exists, fn ($q) => $q->whereKeyNot($this->getKey()))
            ->exists();

        while ($query($slug)) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
