<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    protected function admin(): User
    {
        return User::factory()->admin()->create();
    }

    protected function actingAsAdmin(?User $admin = null): User
    {
        $admin ??= $this->admin();
        Sanctum::actingAs($admin, ['admin']);

        return $admin;
    }

    /**
     * Builds a real PNG of the given size without the GD extension, so MIME
     * sniffing and dimension rules are exercised with genuine image data.
     */
    protected function fakePng(string $name = 'image.png', int $width = 800, int $height = 500): UploadedFile
    {
        $row = "\0".str_repeat("\x22\x44\x66", $width);
        $raw = str_repeat($row, $height);

        $chunk = fn (string $type, string $data) => pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));

        $png = "\x89PNG\r\n\x1a\n"
            .$chunk('IHDR', pack('NNCCCCC', $width, $height, 8, 2, 0, 0, 0))
            .$chunk('IDAT', gzcompress($raw))
            .$chunk('IEND', '');

        return UploadedFile::fake()->createWithContent($name, $png);
    }

    /**
     * A non-fake UploadedFile backed by a temp file. Unlike UploadedFile::fake(),
     * its MIME type is sniffed from the content, like a real HTTP upload.
     */
    protected function realUpload(string $name, string $content): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'upl');
        file_put_contents($path, $content);

        return new UploadedFile($path, $name, null, null, true);
    }

    protected function fakePdf(string $name = 'resume.pdf'): UploadedFile
    {
        $pdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n";

        return UploadedFile::fake()->createWithContent($name, $pdf);
    }
}
