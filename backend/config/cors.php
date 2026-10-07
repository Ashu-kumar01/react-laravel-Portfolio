<?php

/*
| Only the React frontend origin(s) may call the API from a browser.
| Set CORS_ALLOWED_ORIGINS to a comma-separated list for multiple origins;
| it defaults to FRONTEND_URL. Auth uses bearer tokens, so credentials
| (cookies) are not needed cross-origin.
*/

// `?:` (not env()'s default) so an empty `CORS_ALLOWED_ORIGINS=` line still falls back to FRONTEND_URL.
$origins = array_filter(array_map('trim', explode(',', (string) (env('CORS_ALLOWED_ORIGINS') ?: env('FRONTEND_URL', 'http://localhost:5173')))));

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values($origins),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],

    'exposed_headers' => ['Content-Disposition', 'Retry-After'],

    'max_age' => 3600,

    'supports_credentials' => false,

];
