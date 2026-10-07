<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use AuthorizesRequests;

    /** Clamp a requested page size to a safe range. */
    protected function perPage(int $requested, int $default = 15, int $max = 100): int
    {
        return $requested > 0 ? min($requested, $max) : $default;
    }
}
