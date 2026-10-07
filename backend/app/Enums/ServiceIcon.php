<?php

namespace App\Enums;

/**
 * Allow-list of icon keys the frontend knows how to render for services.
 * Keeps arbitrary strings out of the UI layer.
 */
enum ServiceIcon: string
{
    case Server = 'server';
    case Api = 'api';
    case Code = 'code';
    case Layout = 'layout';
    case Palette = 'palette';
    case Globe = 'globe';
    case Dashboard = 'dashboard';
    case Plug = 'plug';
    case Smartphone = 'smartphone';
    case Database = 'database';
    case Shield = 'shield';
    case Zap = 'zap';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
