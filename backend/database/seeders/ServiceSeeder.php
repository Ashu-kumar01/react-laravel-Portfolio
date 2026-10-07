<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

/** Services described in terms of the owner's actual skills. */
class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['Website Development', 'globe', 'Responsive business, education and organisation websites — the kind I have built 30+ of.', ['Responsive, cross-browser layouts', 'Search-friendly structure', 'Performance-minded frontend']],
            ['UI/UX Design', 'palette', 'Clean, modern interfaces designed in Figma and translated faithfully into code.', ['Design-to-code implementation', 'Dashboards, forms & landing pages', 'Mobile-first responsive layouts']],
            ['PHP Development', 'database', 'PHP web applications with CRUD, form handling, authentication and MySQL integration.', ['Core PHP applications', 'MySQL database integration', 'Maintenance & bug fixing']],
            ['Laravel Backend Development', 'server', 'Laravel applications built on MVC with routing, Eloquent, migrations, validation and authentication.', ['MVC architecture & Eloquent ORM', 'Migrations, seeders & relationships', 'Validation & authentication']],
            ['REST API Development', 'api', 'REST APIs in PHP and Laravel with validation, authentication and clean JSON responses.', ['Login / register APIs', 'Validated JSON responses', 'Tested with Postman']],
            ['React.js Development', 'code', 'Component-based React interfaces connected to Laravel REST APIs.', ['Vite + React setup', 'REST API integration', 'Tailwind CSS styling']],
            ['Admin Panel Development', 'dashboard', 'Dashboards and admin panels with tables, forms, modals and CRUD workflows.', ['Data tables & filters', 'CRUD workflows', 'Responsive admin UI']],
            ['API Integration', 'plug', 'Connecting frontends to REST APIs and integrating third-party services.', ['API consumption & response handling', 'Laravel HTTP Client', 'Error handling']],
            ['Flutter UI Development', 'smartphone', 'Cross-platform mobile UI with Flutter and Dart — an area I am actively learning and building experience in.', ['Widget-based UI', 'API-connected screens', 'Currently learning']],
        ];

        foreach ($services as $index => [$title, $icon, $short, $features]) {
            Service::query()->firstOrCreate(['title' => $title], [
                'icon' => $icon,
                'short_description' => $short,
                'features' => $features,
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);
        }
    }
}
