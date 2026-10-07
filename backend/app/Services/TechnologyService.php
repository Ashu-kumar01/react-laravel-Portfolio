<?php

namespace App\Services;

use App\Models\Technology;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

class TechnologyService
{
    private const ICON_DIR = 'technologies';

    public function __construct(private readonly FileStorageService $files) {}

    public function create(array $data): Technology
    {
        $technology = new Technology(Arr::except($data, ['icon', 'remove_icon']));

        if (($icon = $data['icon'] ?? null) instanceof UploadedFile) {
            $technology->icon_path = $this->files->storePublic($icon, self::ICON_DIR);
        }

        $technology->save();

        return $technology;
    }

    public function update(Technology $technology, array $data): Technology
    {
        $obsolete = null;
        $technology->fill(Arr::except($data, ['icon', 'remove_icon']));

        if (($icon = $data['icon'] ?? null) instanceof UploadedFile) {
            $obsolete = $technology->icon_path;
            $technology->icon_path = $this->files->storePublic($icon, self::ICON_DIR);
        } elseif (! empty($data['remove_icon'])) {
            $obsolete = $technology->icon_path;
            $technology->icon_path = null;
        }

        $technology->save();
        $this->files->deletePublic($obsolete);

        return $technology;
    }

    public function delete(Technology $technology): void
    {
        $path = $technology->icon_path;
        $technology->delete();
        $this->files->deletePublic($path);
    }
}
