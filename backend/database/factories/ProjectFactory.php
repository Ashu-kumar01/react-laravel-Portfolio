<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(3),
            'short_description' => fake()->sentence(12),
            'description' => fake()->paragraphs(2, true),
            'category' => fake()->randomElement(['Web Application', 'Business', 'Education']),
            'client' => fake()->company(),
            'role' => 'Full-Stack Developer',
            'technologies' => ['PHP', 'Laravel', 'MySQL'],
            'features' => ['Feature one', 'Feature two'],
            'featured' => false,
            'status' => ProjectStatus::Published,
            'sort_order' => fake()->numberBetween(1, 50),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ProjectStatus::Draft]);
    }

    public function featured(): static
    {
        return $this->state(['featured' => true]);
    }
}
