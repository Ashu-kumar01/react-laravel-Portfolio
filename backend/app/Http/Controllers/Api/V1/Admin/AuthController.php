<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $login = trim((string) $request->input('login'));
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        // utf8mb4_unicode_ci collation makes this lookup case-insensitive.
        $user = User::query()->where($field, $login)->first();
        $password = (string) $request->input('password');

        // Same generic message for unknown user, wrong password or non-admin.
        if (! $user || ! Hash::check($password, $user->password) || ! $user->isAdmin()) {
            throw ValidationException::withMessages([
                'login' => 'These credentials do not match our records.',
            ]);
        }

        if (Hash::needsRehash($user->password)) {
            $user->password = $password;
        }

        $user->last_login_at = now();
        $user->save();

        $minutes = (int) config('sanctum.expiration', 480);
        $expiresAt = now()->addMinutes($minutes);
        $token = $user->createToken('admin-panel', ['admin'], $expiresAt);

        return ApiResponse::success([
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toIso8601String(),
            'user' => (new UserResource($user))->resolve($request),
        ], 'Logged in successfully');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return ApiResponse::success(null, 'Logged out successfully');
    }

    public function me(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        return ApiResponse::success(new UserResource($request->user()), 'Authenticated user', [
            'expires_at' => $token?->expires_at?->toIso8601String(),
        ]);
    }
}
