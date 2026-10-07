<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Experience>
 */
class ExperienceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'type' => 'work',
            'company' => fake()->company(),
            'position' => fake()->jobTitle(),
            'location' => fake()->city(),
            'start_date' => fake()->dateTimeBetween('-5 years', '-1 year')->format('Y-m-d'),
            'end_date' => null,
            'is_current' => true,
            'description' => fake()->sentence(15),
            'responsibilities' => [fake()->sentence(), fake()->sentence()],
            'technologies' => ['PHP', 'Laravel'],
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
