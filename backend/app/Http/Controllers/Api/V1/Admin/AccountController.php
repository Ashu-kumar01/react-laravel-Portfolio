<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAccountRequest;
use App\Http\Requests\Admin\UpdatePasswordRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
    public function update(UpdateAccountRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return ApiResponse::success(new UserResource($user), 'Profile updated successfully');
    }

    public function password(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->password = (string) $request->input('password');
        $user->save();

        // Sign out every other session; keep the one that made the change.
        $currentId = $user->currentAccessToken()?->id;
        $user->tokens()->when($currentId, fn ($q) => $q->whereKeyNot($currentId))->delete();

        return ApiResponse::success(null, 'Password changed successfully. Other sessions have been signed out.');
    }
}
