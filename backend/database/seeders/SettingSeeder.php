<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Database\Seeder;

/**
 * Profile content supplied by Ashwani Kumar Kushwaha. Everything here is
 * editable from Admin -> Settings.
 */
class SettingSeeder extends Seeder
{
    public function run(SettingService $settings): void
    {
        $defaults = [
            'full_name' => 'Ashwani Kumar Kushwaha',
            'display_name' => 'Ashwani Kushwaha',
            'title' => 'Frontend & PHP/Laravel Developer',
            'tagline' => 'PHP • Laravel • React • REST APIs • MySQL',
            'headline' => 'I build responsive, scalable and user-focused web applications using modern frontend technologies, PHP, Laravel, REST APIs and MySQL.',
            'summary' => 'Frontend & PHP/Laravel developer from Raipur with 3.8+ years of experience and 30+ real-world websites — responsive UI, PHP/Laravel applications, REST APIs and MySQL.',
            'about' => implode("\n\n", [
                "I'm a web developer with 3.8+ years of professional experience designing, developing and maintaining responsive, user-friendly web applications.",
                'My core expertise covers HTML5, CSS3, JavaScript, Bootstrap, Tailwind CSS, PHP, Laravel, MySQL and REST APIs. I have worked on real-world websites, an educational ERP, business websites, dashboards and custom web applications — and contributed to 30+ websites across education, business, organisational and service domains.',
                'I enjoy turning UI/UX concepts into clean, responsive and functional interfaces, with a focus on performance, maintainability and user experience.',
                "Right now I'm deepening my expertise in Laravel API development, React.js and full-stack architecture, and exploring Flutter and Dart for cross-platform mobile development.",
            ]),
            'career_goal' => 'To grow as a skilled full-stack developer by combining strong frontend expertise with PHP, Laravel, REST APIs, database architecture and modern JavaScript — building scalable, secure, high-performance web applications, and expanding into cross-platform mobile development with Flutter.',
            'location' => 'Raipur, Chhattisgarh, India',
            'years_experience' => 3.8,
            'websites_count' => 30,
            'availability' => 'Open to new opportunities',
            'meta_title' => 'Ashwani Kumar Kushwaha — Frontend & PHP/Laravel Developer',
            'meta_description' => 'Frontend & PHP/Laravel developer in Raipur with 3.8+ years of experience: responsive UI, Laravel, REST APIs, MySQL and React.js.',
            'meta_keywords' => 'Frontend Developer, PHP Developer, Laravel Developer, PHP Laravel Developer, Full Stack Developer, React Developer, REST API Developer, UI UX Developer, Web Developer Raipur',

            // Landing section (home page hero)
            'hero_eyebrow' => "Hello, I'm",
            'hero_name' => 'Ashwani Kumar',
            'hero_role' => 'Frontend Developer',
            'hero_summary' => 'Building modern, scalable and interactive web experiences with React, Laravel, PHP and JavaScript.',
            'hero_badges' => [
                ['label' => 'React.js', 'icon' => 'react'],
                ['label' => 'Laravel', 'icon' => 'laravel'],
                ['label' => 'PHP', 'icon' => 'php'],
                ['label' => 'JavaScript', 'icon' => 'javascript'],
                ['label' => 'MySQL', 'icon' => 'mysql'],
                ['label' => 'Three.js', 'icon' => 'threejs'],
            ],
            'hero_floating_badges' => [
                ['value' => null, 'label' => 'Open to new opportunities'],
                ['value' => '3.8+', 'label' => 'Years of experience'],
                ['value' => '30+', 'label' => 'Websites & projects'],
                ['value' => null, 'label' => 'Raipur, Chhattisgarh, India'],
            ],
            'hero_tech_bubbles' => ['react', 'laravel', 'php', 'javascript'],
        ];

        // Only fill keys that have not been set yet, so re-seeding keeps admin edits.
        $existing = Setting::query()->pluck('key')->all();
        $settings->update(array_diff_key($defaults, array_flip($existing)));
    }
}
