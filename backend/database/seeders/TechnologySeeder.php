<?php

namespace Database\Seeders;

use App\Models\Technology;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Skills and levels as described in the owner's profile (no percentages).
 * Edit from Admin -> Technologies.
 */
class TechnologySeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            'frontend' => [
                ['HTML5', 'advanced'], ['CSS3', 'advanced'], ['JavaScript', 'advanced'], ['Bootstrap', 'advanced'],
                ['Tailwind CSS', 'intermediate'], ['SCSS', 'intermediate'], ['jQuery', 'intermediate'], ['React.js', 'learning'],
            ],
            'backend' => [
                ['PHP', 'advanced'], ['Laravel', 'intermediate'], ['REST API', 'intermediate'],
            ],
            'database' => [
                ['MySQL', 'advanced'],
            ],
            'design' => [
                ['UI Development', 'advanced'], ['Responsive Design', 'advanced'], ['UI/UX Design', 'intermediate'], ['Web Design', 'intermediate'],
            ],
            'tools' => [
                ['Git', 'intermediate'], ['GitHub', 'intermediate'], ['VS Code', 'intermediate'], ['Sublime Text', 'intermediate'],
                ['Chrome DevTools', 'intermediate'], ['Postman', 'intermediate'], ['Figma', 'intermediate'], ['npm', 'intermediate'],
                ['Composer', 'intermediate'], ['Vite', 'learning'],
            ],
            'mobile' => [
                ['Flutter', 'learning'], ['Dart', 'learning'],
            ],
        ];

        foreach ($catalog as $category => $items) {
            foreach ($items as $index => [$name, $level]) {
                Technology::query()->firstOrCreate(
                    ['slug' => Str::slug(str_replace(['.', '/'], ['', '-'], $name))],
                    [
                        'name' => $name,
                        'category' => $category,
                        'proficiency' => $level,
                        'sort_order' => $index + 1,
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
