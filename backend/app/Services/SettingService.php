<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    private const CACHE_KEY = 'portfolio.settings';

    private const IMAGE_DIR = 'settings';

    public function __construct(private readonly FileStorageService $files) {}

    /** @return array<string, array{group: string, public: bool, rules: array, type?: string, nested?: array, dimensions?: string}> */
    public function schema(): array
    {
        return config('portfolio.settings');
    }

    /** All known settings with their stored values (null when unset). Image settings hold storage paths. */
    public function all(): array
    {
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => Setting::query()->pluck('value', 'key')->all());

        $values = [];
        foreach ($this->schema() as $key => $definition) {
            $values[$key] = $this->cast($key, $stored[$key] ?? null);
        }

        return $values;
    }

    /** Settings as clients see them: image paths become absolute URLs. */
    public function presented(?array $values = null): array
    {
        $values ??= $this->all();

        foreach ($this->imageKeys() as $key) {
            if (array_key_exists($key, $values)) {
                $values[$key] = FileStorageService::url($values[$key]);
            }
        }

        return $values;
    }

    public function public(): array
    {
        $schema = $this->schema();

        return $this->presented(array_filter($this->all(), fn ($key) => $schema[$key]['public'] ?? false, ARRAY_FILTER_USE_KEY));
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    /** Keys whose value is an uploaded image (managed through setImage/removeImage, not update). */
    public function imageKeys(): array
    {
        return array_keys(array_filter($this->schema(), fn ($definition) => ($definition['type'] ?? null) === 'image'));
    }

    /** Rules keyed for a FormRequest: only known, non-image keys are accepted. */
    public function rules(): array
    {
        $rules = [];
        foreach ($this->schema() as $key => $definition) {
            if (($definition['type'] ?? null) === 'image') {
                continue;
            }

            $rules[$key] = array_merge(['sometimes'], $definition['rules']);
            foreach ($definition['nested'] ?? [] as $suffix => $nestedRules) {
                $rules["{$key}.{$suffix}"] = $nestedRules;
            }
        }

        return $rules;
    }

    public function update(array $values): array
    {
        $schema = $this->schema();

        foreach ($values as $key => $value) {
            if (! isset($schema[$key]) || ($schema[$key]['type'] ?? null) === 'image') {
                continue;
            }

            $this->write($key, $value);
        }

        $this->flush();

        return $this->all();
    }

    /** Stores an uploaded image for an image setting and deletes the file it replaces. */
    public function setImage(string $key, UploadedFile $file): array
    {
        $previous = $this->get($key);
        $this->write($key, $this->files->storePublic($file, self::IMAGE_DIR));
        $this->flush();
        $this->files->deletePublic($previous);

        return $this->all();
    }

    public function removeImage(string $key): array
    {
        $previous = $this->get($key);
        $this->write($key, null);
        $this->flush();
        $this->files->deletePublic($previous);

        return $this->all();
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    private function write(string $key, mixed $value): void
    {
        $definition = $this->schema()[$key];

        if (($definition['type'] ?? null) === 'json' && $value !== null) {
            // Lists are stored without their keys so the JSON is always an array.
            $value = json_encode(array_is_list($value) ? $value : array_values($value), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        Setting::query()->updateOrCreate(
            ['key' => $key],
            [
                'value' => $value === null ? null : (string) $value,
                'group' => $definition['group'],
                'is_public' => $definition['public'],
            ],
        );
    }

    private function cast(string $key, ?string $value): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        $definition = $this->schema()[$key];

        if (($definition['type'] ?? null) === 'json') {
            $decoded = json_decode($value, true);

            return is_array($decoded) ? $decoded : null;
        }

        $rules = $definition['rules'];

        return match (true) {
            in_array('integer', $rules, true) => (int) $value,
            in_array('numeric', $rules, true) => (float) $value,
            default => $value,
        };
    }
}
