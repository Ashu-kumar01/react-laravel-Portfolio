<?php

namespace App\Enums;

/**
 * Honest skill levels instead of invented percentages.
 */
enum TechnologyLevel: string
{
    case Advanced = 'advanced';
    case Intermediate = 'intermediate';
    case Learning = 'learning';

    public function label(): string
    {
        return match ($this) {
            self::Advanced => 'Advanced',
            self::Intermediate => 'Intermediate',
            self::Learning => 'Currently learning',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
