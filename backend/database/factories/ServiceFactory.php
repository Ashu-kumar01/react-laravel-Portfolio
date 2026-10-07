<?php

namespace Database\Factories;

use App\Enums\ServiceIcon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->words(3, true),
            'short_description' => fake()->sentence(10),
            'description' => fake()->paragraph(),
            'icon' => fake()->randomElement(ServiceIcon::values()),
            'features' => [fake()->words(3, true)],
            'sort_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
