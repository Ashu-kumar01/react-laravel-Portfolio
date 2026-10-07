<?php

namespace App\Enums;

enum TechnologyCategory: string
{
    case Frontend = 'frontend';
    case Backend = 'backend';
    case Database = 'database';
    case Mobile = 'mobile';
    case Tools = 'tools';
    case Design = 'design';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
