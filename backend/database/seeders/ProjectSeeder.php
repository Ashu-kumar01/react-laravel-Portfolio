<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Projects and contributions as described by the owner. No invented metrics.
 * `features` holds the owner's contributions (shown as "What I worked on").
 * Images, live URLs and dates are left empty to be filled in from the admin
 * panel; the frontend renders a branded cover until an image is uploaded.
 */
class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            [
                'title' => 'OpenCompas Educational ERP',
                'category' => 'Educational ERP',
                'client' => null,
                'role' => 'Frontend & PHP Developer',
                'featured' => true,
                'short_description' => 'Educational ERP platform for academic and administrative workflows — UI redesign, frontend development, PHP integration and usability improvements.',
                'description' => "OpenCompas is an educational ERP platform designed to manage academic and administrative workflows.\n\nI contributed to redesigning the ERP user interface, building a responsive UI and improving usability. I worked within the existing PHP application, developing and modifying frontend modules and database-driven interfaces.",
                'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL'],
                'features' => [
                    'Redesigned the ERP user interface',
                    'Developed a responsive UI',
                    'Improved usability across modules',
                    'Worked with the existing PHP application',
                    'Developed and modified frontend modules',
                    'Built database-driven interfaces',
                ],
            ],
            [
                'title' => 'Shri Rawatpura Sarkar University Website',
                'category' => 'University Website',
                'client' => 'Shri Rawatpura Sarkar University',
                'role' => 'Frontend Developer',
                'featured' => true,
                'short_description' => 'University website with responsive layouts, content sections and interactive components optimised across devices.',
                'description' => 'Website for Shri Rawatpura Sarkar University. I worked on the website UI — responsive layouts, content sections and interactive components — and optimised the experience across devices.',
                'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'PHP'],
                'features' => [
                    'Website UI development',
                    'Responsive layouts',
                    'Content sections',
                    'Interactive components',
                    'Cross-device optimisation',
                ],
            ],
            [
                'title' => 'Hexa Jobs Website',
                'category' => 'Job Portal',
                'client' => 'Hexa Jobs',
                'role' => 'Frontend Developer',
                'featured' => true,
                'short_description' => 'Job and recruitment platform — website UI, job-related interfaces and responsive layouts.',
                'description' => 'Hexa Jobs is a job and recruitment platform. I worked on the website UI and frontend development, including job-related interfaces and responsive layouts.',
                'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
                'features' => [
                    'Website UI',
                    'Frontend development',
                    'Job-related interfaces',
                    'Responsive layouts',
                ],
            ],
            [
                'title' => 'The Great India Raipur Website',
                'category' => 'Business Website',
                'client' => 'The Great India, Raipur',
                'role' => 'Frontend Developer',
                'featured' => false,
                'short_description' => 'Business / organisation website — frontend development, responsive UI and usability improvements.',
                'description' => 'Website for The Great India, Raipur. I handled frontend development and the responsive UI, implemented the website sections and worked on performance and usability improvements.',
                'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
                'features' => [
                    'Frontend development',
                    'Responsive UI',
                    'Website sections',
                    'UI implementation',
                    'Performance and usability improvements',
                ],
            ],
            [
                'title' => 'MAIC College Website',
                'category' => 'Educational Website',
                'client' => 'MAIC College',
                'role' => 'Web Developer',
                'featured' => false,
                'short_description' => 'Educational website — development, responsive design and frontend components.',
                'description' => 'Website for MAIC College. I worked on website development, responsive design, UI implementation and frontend components.',
                'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
                'features' => [
                    'Website development',
                    'Responsive design',
                    'UI implementation',
                    'Frontend components',
                ],
            ],
            [
                'title' => 'Munchhonn Website',
                'category' => 'Business Website',
                'client' => 'Munchhonn',
                'role' => 'Frontend Developer',
                'featured' => false,
                'short_description' => 'Business website — frontend development, responsive layout and interactive components.',
                'description' => 'Business website for Munchhonn. I worked on frontend development, building a responsive website with UI implementation and interactive components.',
                'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
                'features' => [
                    'Frontend development',
                    'Responsive website',
                    'UI implementation',
                    'Interactive components',
                ],
            ],
            [
                'title' => 'Fuel Save Website',
                'category' => 'Business Website',
                'client' => 'Fuel Save',
                'role' => 'Frontend Developer',
                'featured' => false,
                'short_description' => 'Business / product website — frontend development, responsive UI and website components.',
                'description' => 'Business and product website for Fuel Save. I worked on frontend development, the responsive UI, website components and user interface implementation.',
                'technologies' => ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
                'features' => [
                    'Frontend development',
                    'Responsive UI',
                    'Website components',
                    'User interface implementation',
                ],
            ],
        ];

        foreach ($projects as $index => $data) {
            $project = Project::withTrashed()->firstOrNew(['title' => $data['title']]);

            if ($project->exists) {
                continue;
            }

            $project->fill($data + [
                'status' => ProjectStatus::Published,
                'sort_order' => $index + 1,
            ])->save();
        }
    }
}
