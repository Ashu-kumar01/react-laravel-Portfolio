<?php

namespace App\Support;

final class ListInput
{
    /**
     * Normalises a list field from JSON or multipart input: trims values and
     * drops blanks (blank strings arrive as null via ConvertEmptyStringsToNull).
     *
     * @return list<string>
     */
    public static function clean(mixed $values): array
    {
        return array_values(array_filter(
            array_map(fn ($v) => trim((string) $v), (array) $values),
            fn (string $v) => $v !== '',
        ));
    }

    /** Applies clean() to the given keys when present. */
    public static function cleanKeys(array $data, array $keys): array
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $data)) {
                $data[$key] = self::clean($data[$key]);
            }
        }

        return $data;
    }
}
