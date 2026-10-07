<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $config = config('portfolio.admin');
        $password = $config['password'];

        if (blank($password)) {
            if (app()->isProduction()) {
                throw new RuntimeException('Set ADMIN_PASSWORD before seeding the admin account in production.');
            }

            // Documented development-only credential. Change it before deploying.
            $password = $config['development_password'];
        }

        $user = User::query()->firstOrNew(['username' => $config['username']]);

        // Never overwrite an existing (possibly changed) password on re-seed.
        if (! $user->exists) {
            $user->password = $password;
        }

        $user->fill(['name' => $config['name'], 'email' => $config['email']]);
        $user->is_admin = true;
        $user->email_verified_at ??= now();
        $user->save();
    }
}
