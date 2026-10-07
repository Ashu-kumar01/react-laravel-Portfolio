<?php

use Illuminate\Support\Facades\Route;

// This application is an API; the public site and admin UI live in the React app.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'api' => url('/api/v1'),
    'frontend' => config('portfolio.frontend_url'),
]));
