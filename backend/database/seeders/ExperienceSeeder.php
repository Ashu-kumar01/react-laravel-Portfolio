<?php

namespace Database\Seeders;

use App\Models\Experience;
use Illuminate\Database\Seeder;

/**
 * Career and education entries from the owner's profile.
 * The employer name was not provided, so the work entry uses a neutral
 * description — set the real company from Admin -> Experience.
 * Education entries only have known years; dates use 1 January.
 */
class ExperienceSeeder extends Seeder
{
    public function run(): void
    {
        if (Experience::query()->exists()) {
            return;
        }

        Experience::query()->create([
            'type' => 'work',
            'company' => 'Client & company web projects',
            'position' => 'Frontend Developer / Web Developer',
            'location' => 'Raipur, Chhattisgarh, India',
            'employment_type' => 'Full-time',
            // ~3.8 years before October 2026.
            'start_date' => '2023-01-01',
            'end_date' => null,
            'is_current' => true,
            'description' => 'Designing, developing and maintaining responsive websites and PHP/Laravel web applications — contributing to 30+ websites across education, business, organisational and service domains.',
            'responsibilities' => [
                'Develop responsive websites and convert UI/UX designs into functional interfaces',
                'Build PHP-based web applications and work with Laravel',
                'Create and consume REST APIs; integrate APIs with the frontend',
                'Work with MySQL databases',
                'Develop dashboards and admin panels',
                'Debug, maintain and improve existing web applications',
                'Optimise frontend performance and test across screen sizes',
                'Use Git/GitHub on real-world client and company projects',
            ],
            'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'Tailwind CSS', 'PHP', 'Laravel', 'MySQL', 'REST API', 'Git'],
            'sort_order' => 1,
        ]);

        Experience::query()->create([
            'type' => 'education',
            'company' => 'Rungta College of Engineering and Technology, Raipur',
            'position' => 'B.Tech — Computer Science Engineering',
            'location' => 'Raipur, Chhattisgarh',
            'start_date' => '2018-01-01',
            'end_date' => '2022-01-01',
            'is_current' => false,
            'description' => 'CGPA: 7.4 / 10',
            'sort_order' => 1,
        ]);

        Experience::query()->create([
            'type' => 'education',
            'company' => 'Saraswati Shishu Mandir, Ambikapur',
            'position' => 'Class 12',
            'location' => 'Ambikapur, Chhattisgarh',
            'start_date' => '2018-01-01',
            'end_date' => '2018-01-01',
            'is_current' => false,
            'description' => 'Percentage: 69.4%',
            'sort_order' => 2,
        ]);
    }
}
