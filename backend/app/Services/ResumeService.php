<?php

namespace App\Services;

use App\Models\Resume;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResumeService
{
    private const DIR = 'resumes';

    public function __construct(private readonly FileStorageService $files) {}

    public function current(): ?Resume
    {
        return Resume::query()->current()->first();
    }

    /** Uploading replaces the previous resume (record and file). */
    public function replace(UploadedFile $file, ?string $title, ?User $user): Resume
    {
        $path = $this->files->storePrivate($file, self::DIR);

        try {
            return DB::transaction(function () use ($file, $title, $user, $path) {
                $previous = Resume::query()->get();

                $resume = Resume::query()->create([
                    'title' => $title ?: 'Resume',
                    'file_path' => $path,
                    'original_name' => Str::limit($file->getClientOriginalName(), 200, ''),
                    'mime_type' => $file->getMimeType() ?: 'application/pdf',
                    'size' => $file->getSize(),
                    'is_active' => true,
                    'uploaded_by' => $user?->id,
                ]);

                foreach ($previous as $old) {
                    $this->files->deletePrivate($old->file_path);
                    $old->delete();
                }

                return $resume;
            });
        } catch (\Throwable $e) {
            $this->files->deletePrivate($path);
            throw $e;
        }
    }

    public function delete(Resume $resume): void
    {
        $this->files->deletePrivate($resume->file_path);
        $resume->delete();
    }

    public function exists(Resume $resume): bool
    {
        return Storage::disk('local')->exists($resume->file_path);
    }

    public function download(Resume $resume, bool $countDownload = true): StreamedResponse
    {
        if ($countDownload) {
            $resume->increment('download_count');
        }

        return Storage::disk('local')->download($resume->file_path, $this->downloadName($resume), [
            'Content-Type' => 'application/pdf',
            'Cache-Control' => 'no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function downloadName(Resume $resume): string
    {
        $owner = Str::slug(config('portfolio.admin.name', 'resume'));

        return ($owner ?: 'resume').'-resume.pdf';
    }
}
