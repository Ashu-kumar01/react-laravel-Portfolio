<?php

namespace Database\Factories;

use App\Enums\TechnologyCategory;
use App\Enums\TechnologyLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Technology>
 */
class TechnologyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word().' '.fake()->numberBetween(1, 999),
            'category' => fake()->randomElement(TechnologyCategory::values()),
            'proficiency' => fake()->randomElement(TechnologyLevel::values()),
            'sort_order' => fake()->numberBetween(1, 20),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
