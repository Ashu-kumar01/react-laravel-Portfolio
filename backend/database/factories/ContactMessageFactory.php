<?php

namespace Database\Factories;

use App\Enums\MessageStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => null,
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraph(),
            'status' => MessageStatus::New,
        ];
    }

    public function status(MessageStatus $status): static
    {
        return $this->state(['status' => $status]);
    }
}
