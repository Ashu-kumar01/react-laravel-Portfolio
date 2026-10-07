<?php

return [

    /*
    | Public React site URL. Used for CORS, the sitemap and absolute links.
    */
    'frontend_url' => rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/'),

    /*
    | Admin seed account. The development password is only used when
    | ADMIN_PASSWORD is empty AND the app is not running in production.
    */
    'admin' => [
        'name' => env('ADMIN_NAME', 'Ashwani Kumar Kushwaha'),
        'username' => env('ADMIN_USERNAME', 'Admin'),
        'email' => env('ADMIN_EMAIL', 'admin@example.com'),
        'password' => env('ADMIN_PASSWORD'),
        'development_password' => 'Ashwani@#1q2',
    ],

    'uploads' => [
        'image_max_kb' => 4096,
        'icon_max_kb' => 512,
        'resume_max_kb' => 5120,
        'gallery_max_items' => 12,
    ],

    /*
    | Editable site settings. Every key is validated against these rules and
    | `public` controls whether it is exposed through GET /api/v1/profile.
    |
    | Optional per-key options:
    |  - type:       'json' (arrays, stored encoded) or 'image' (uploaded through
    |                POST /admin/settings/images/{key}; exposed as an absolute URL)
    |  - nested:     extra rules for array items, keyed by suffix (e.g. '*.label')
    |  - dimensions: image dimension rule for 'image' settings
    */
    'settings' => [
        // Landing section (home page hero)
        'hero_eyebrow' => ['group' => 'hero', 'public' => true, 'rules' => ['nullable', 'string', 'max:60']],
        'hero_name' => ['group' => 'hero', 'public' => true, 'rules' => ['nullable', 'string', 'max:120']],
        'hero_role' => ['group' => 'hero', 'public' => true, 'rules' => ['nullable', 'string', 'max:120']],
        'hero_summary' => ['group' => 'hero', 'public' => true, 'rules' => ['nullable', 'string', 'max:300']],
        'hero_image' => [
            'group' => 'hero', 'public' => true, 'type' => 'image', 'rules' => [],
            'dimensions' => 'min_width=200,min_height=200,max_width=6000,max_height=6000',
        ],
        // Glass technology badges under the hero text: [{label, icon}]
        'hero_badges' => [
            'group' => 'hero', 'public' => true, 'type' => 'json', 'rules' => ['nullable', 'array', 'max:12'],
            'nested' => [
                '*' => ['array:label,icon'],
                '*.label' => ['required', 'string', 'max:40'],
                '*.icon' => ['nullable', 'string', 'max:40', 'alpha_dash:ascii'],
            ],
        ],
        // Badges floating around the portrait: [{value, label}] — with a value it renders as a stat card
        'hero_floating_badges' => [
            'group' => 'hero', 'public' => true, 'type' => 'json', 'rules' => ['nullable', 'array', 'max:4'],
            'nested' => [
                '*' => ['array:value,label'],
                '*.value' => ['nullable', 'string', 'max:20'],
                '*.label' => ['required', 'string', 'max:60'],
            ],
        ],
        // Round technology icons around the portrait: ['react', 'laravel', ...]
        'hero_tech_bubbles' => [
            'group' => 'hero', 'public' => true, 'type' => 'json', 'rules' => ['nullable', 'array', 'max:4'],
            'nested' => ['*' => ['required', 'string', 'max:40', 'alpha_dash:ascii']],
        ],

        // Profile
        'full_name' => ['group' => 'profile', 'public' => true, 'rules' => ['required', 'string', 'max:120']],
        'display_name' => ['group' => 'profile', 'public' => true, 'rules' => ['required', 'string', 'max:60']],
        'title' => ['group' => 'profile', 'public' => true, 'rules' => ['required', 'string', 'max:120']],
        'tagline' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'string', 'max:160']],
        'headline' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'string', 'max:200']],
        'summary' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'string', 'max:600']],
        'about' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'string', 'max:5000']],
        'location' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'string', 'max:120']],
        'years_experience' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'numeric', 'min:0', 'max:60']],
        'websites_count' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'integer', 'min:0', 'max:10000']],
        'availability' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'string', 'max:120']],
        'career_goal' => ['group' => 'profile', 'public' => true, 'rules' => ['nullable', 'string', 'max:1500']],

        // Contact & social
        'email' => ['group' => 'contact', 'public' => true, 'rules' => ['nullable', 'email:rfc', 'max:190']],
        'phone' => ['group' => 'contact', 'public' => true, 'rules' => ['nullable', 'string', 'max:30']],
        'github_url' => ['group' => 'social', 'public' => true, 'rules' => ['nullable', 'url:https', 'max:300']],
        'linkedin_url' => ['group' => 'social', 'public' => true, 'rules' => ['nullable', 'url:https', 'max:300']],

        // SEO
        'meta_title' => ['group' => 'seo', 'public' => true, 'rules' => ['nullable', 'string', 'max:70']],
        'meta_description' => ['group' => 'seo', 'public' => true, 'rules' => ['nullable', 'string', 'max:170']],
        'meta_keywords' => ['group' => 'seo', 'public' => true, 'rules' => ['nullable', 'string', 'max:300']],
        'og_image' => [
            'group' => 'seo', 'public' => true, 'type' => 'image', 'rules' => [],
            'dimensions' => 'min_width=600,min_height=315,max_width=6000,max_height=6000',
        ],
        'twitter_handle' => ['group' => 'seo', 'public' => true, 'rules' => ['nullable', 'string', 'regex:/^@?[A-Za-z0-9_]{1,15}$/']],

        // Private
        'notification_email' => ['group' => 'notifications', 'public' => false, 'rules' => ['nullable', 'email:rfc', 'max:190']],
    ],
];
