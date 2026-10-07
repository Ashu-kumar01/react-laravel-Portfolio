<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Central place for storing/deleting uploads. File names are always generated
 * server-side; user-supplied names are never used as paths.
 */
class FileStorageService
{
    public function storePublic(UploadedFile $file, string $directory): string
    {
        $extension = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension());
        $name = Str::uuid()->toString().'.'.$extension;

        return $file->storeAs($directory, $name, 'public');
    }

    public function storePrivate(UploadedFile $file, string $directory): string
    {
        $extension = strtolower($file->guessExtension() ?: 'bin');

        return $file->storeAs($directory, Str::uuid()->toString().'.'.$extension, 'local');
    }

    public function deletePublic(?string $path): void
    {
        if ($path && ! Str::startsWith($path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($path);
        }
    }

    public function deletePrivate(?string $path): void
    {
        if ($path) {
            Storage::disk('local')->delete($path);
        }
    }

    /** Absolute URL for a stored public file, or passthrough for external URLs. */
    public static function url(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
