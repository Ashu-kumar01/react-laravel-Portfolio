<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            SettingSeeder::class,
            TechnologySeeder::class,
            ProjectSeeder::class,
            ExperienceSeeder::class,
            ServiceSeeder::class,
        ]);
    }
}
