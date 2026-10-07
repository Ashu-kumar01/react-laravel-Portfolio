<?php

namespace App\Services;

use App\Models\Project;
use App\Support\ListInput;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    private const IMAGE_DIR = 'projects';

    public function __construct(private readonly FileStorageService $files) {}

    /**
     * @param  array<string, mixed>  $data  validated input
     */
    public function create(array $data): Project
    {
        return DB::transaction(function () use ($data) {
            $project = new Project($this->attributes($data));

            if (($image = $data['featured_image'] ?? null) instanceof UploadedFile) {
                $project->featured_image = $this->files->storePublic($image, self::IMAGE_DIR);
            }

            $project->gallery = $this->storeGallery($data['gallery'] ?? []);
            $project->save();

            return $project;
        });
    }

    public function update(Project $project, array $data): Project
    {
        $obsolete = [];

        $project->fill($this->attributes($data));

        if (($image = $data['featured_image'] ?? null) instanceof UploadedFile) {
            $obsolete[] = $project->featured_image;
            $project->featured_image = $this->files->storePublic($image, self::IMAGE_DIR);
        } elseif (! empty($data['remove_featured_image'])) {
            $obsolete[] = $project->featured_image;
            $project->featured_image = null;
        }

        // Only paths that already belong to this project may be kept.
        if (array_key_exists('keep_gallery', $data) || array_key_exists('gallery', $data)) {
            $current = $project->gallery ?? [];
            // Without keep_gallery, new uploads are appended and nothing is removed.
            $keep = array_key_exists('keep_gallery', $data)
                ? array_values(array_intersect($current, ListInput::clean($data['keep_gallery'])))
                : $current;
            $obsolete = array_merge($obsolete, array_diff($current, $keep));
            $project->gallery = array_merge($keep, $this->storeGallery($data['gallery'] ?? []));
        }

        $project->save();

        foreach (array_filter($obsolete) as $path) {
            $this->files->deletePublic($path);
        }

        return $project;
    }

    public function delete(Project $project): void
    {
        // Soft delete keeps uploaded media so the record can be restored from the database.
        $project->delete();
    }

    private function attributes(array $data): array
    {
        $attributes = Arr::except($data, ['featured_image', 'gallery', 'keep_gallery', 'remove_featured_image']);

        return ListInput::cleanKeys($attributes, ['technologies', 'features']);
    }

    /** @param  array<int, UploadedFile>  $files */
    private function storeGallery(array $files): array
    {
        return array_map(fn (UploadedFile $file) => $this->files->storePublic($file, self::IMAGE_DIR.'/gallery'), $files);
    }
}
