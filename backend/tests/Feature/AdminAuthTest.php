<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(string $password = 'Secret#Pass123'): User
    {
        $user = User::factory()->admin()->create([
            'username' => 'Admin',
            'email' => 'admin@example.com',
            'password' => $password,
        ]);

        return $user;
    }

    public function test_seeded_admin_password_is_hashed_and_can_log_in(): void
    {
        $this->seed(\Database\Seeders\AdminUserSeeder::class);

        $user = User::query()->where('username', 'Admin')->firstOrFail();
        $this->assertNotSame('Ashwani@#1q2', $user->password);
        $this->assertTrue(Hash::check('Ashwani@#1q2', $user->password));
        $this->assertTrue($user->is_admin);

        $this->postJson('/api/v1/admin/login', ['login' => 'Admin', 'password' => 'Ashwani@#1q2'])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['token', 'token_type', 'expires_at', 'user' => ['id', 'username', 'email']]])
            ->assertJsonMissingPath('data.user.password');
    }

    public function test_admin_can_log_in_with_email_case_insensitively(): void
    {
        $this->makeAdmin();

        $this->postJson('/api/v1/admin/login', ['login' => 'ADMIN@example.com', 'password' => 'Secret#Pass123'])
            ->assertOk();
    }

    public function test_invalid_credentials_are_rejected_with_generic_message(): void
    {
        $this->makeAdmin();

        $this->postJson('/api/v1/admin/login', ['login' => 'Admin', 'password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.login.0', 'These credentials do not match our records.');

        $this->postJson('/api/v1/admin/login', ['login' => 'nobody', 'password' => 'whatever'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.login.0', 'These credentials do not match our records.');
    }

    public function test_non_admin_users_cannot_log_in(): void
    {
        User::factory()->create(['username' => 'viewer', 'password' => 'Secret#Pass123']);

        $this->postJson('/api/v1/admin/login', ['login' => 'viewer', 'password' => 'Secret#Pass123'])
            ->assertUnprocessable();
    }

    public function test_login_requires_fields(): void
    {
        $this->postJson('/api/v1/admin/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['login', 'password']);
    }

    public function test_login_is_rate_limited(): void
    {
        $this->makeAdmin();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/admin/login', ['login' => 'Admin', 'password' => 'bad'])->assertUnprocessable();
        }

        $this->postJson('/api/v1/admin/login', ['login' => 'Admin', 'password' => 'bad'])
            ->assertStatus(429)
            ->assertJsonPath('success', false)
            ->assertHeader('Retry-After');
    }

    public function test_protected_routes_require_authentication(): void
    {
        foreach (['/api/v1/admin/me', '/api/v1/admin/dashboard', '/api/v1/admin/projects', '/api/v1/admin/messages', '/api/v1/admin/settings'] as $uri) {
            $this->getJson($uri)->assertUnauthorized()->assertJsonPath('success', false);
        }

        $this->postJson('/api/v1/admin/projects', [])->assertUnauthorized();
        $this->deleteJson('/api/v1/admin/technologies/1')->assertUnauthorized();
    }

    public function test_non_admin_token_is_forbidden(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/admin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_token_authenticates_and_logout_revokes_it(): void
    {
        $this->makeAdmin();
        $token = $this->postJson('/api/v1/admin/login', ['login' => 'Admin', 'password' => 'Secret#Pass123'])->json('data.token');

        $this->withToken($token)->getJson('/api/v1/admin/me')
            ->assertOk()
            ->assertJsonPath('data.username', 'Admin');

        $this->withToken($token)->postJson('/api/v1/admin/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/admin/me')->assertUnauthorized();
    }

    public function test_expired_token_is_rejected(): void
    {
        $admin = $this->makeAdmin();
        $token = $admin->createToken('admin-panel', ['admin'], now()->subMinute())->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/admin/me')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Your session has expired or you are not logged in.');
    }

    public function test_admin_can_change_password_and_other_sessions_are_revoked(): void
    {
        $admin = $this->makeAdmin();
        $other = $admin->createToken('other-device')->plainTextToken;
        $current = $admin->createToken('this-device')->plainTextToken;

        $this->withToken($current)->putJson('/api/v1/admin/account/password', [
            'current_password' => 'wrong',
            'password' => 'NewSecret#2026',
            'password_confirmation' => 'NewSecret#2026',
        ])->assertUnprocessable()->assertJsonValidationErrors('current_password');

        $this->withToken($current)->putJson('/api/v1/admin/account/password', [
            'current_password' => 'Secret#Pass123',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->withToken($current)->putJson('/api/v1/admin/account/password', [
            'current_password' => 'Secret#Pass123',
            'password' => 'NewSecret#2026',
            'password_confirmation' => 'NewSecret#2026',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewSecret#2026', $admin->fresh()->password));
        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->app['auth']->forgetGuards();
        $this->withToken($other)->getJson('/api/v1/admin/me')->assertUnauthorized();

        $this->postJson('/api/v1/admin/login', ['login' => 'Admin', 'password' => 'NewSecret#2026'])->assertOk();
    }

    public function test_admin_can_update_account_details(): void
    {
        $admin = $this->actingAsAdmin();
        User::factory()->create(['username' => 'taken']);

        $this->putJson('/api/v1/admin/account', ['name' => 'A K', 'username' => 'taken', 'email' => 'x@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('username');

        $this->putJson('/api/v1/admin/account', ['name' => 'Ashwani K', 'username' => 'ashwani', 'email' => 'me@example.com'])
            ->assertOk()
            ->assertJsonPath('data.username', 'ashwani');

        $this->assertSame('me@example.com', $admin->fresh()->email);
    }
}
