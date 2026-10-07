<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingImageRequest;
use App\Http\Requests\Admin\SettingsRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(private readonly SettingService $settings) {}

    public function show(): JsonResponse
    {
        $this->authorize('viewAny', Setting::class);

        $groups = collect($this->settings->schema())->map(fn ($definition) => $definition['group']);

        return ApiResponse::success($this->settings->presented(), 'Settings fetched successfully', ['groups' => $groups]);
    }

    public function update(SettingsRequest $request): JsonResponse
    {
        return ApiResponse::success($this->settings->presented($this->settings->update($request->validated())), 'Settings saved successfully');
    }

    /** POST /admin/settings/images/{key} — upload or replace an image setting. */
    public function uploadImage(SettingImageRequest $request, string $key): JsonResponse
    {
        $this->ensureImageKey($key);

        $values = $this->settings->setImage($key, $request->file('image'));

        return ApiResponse::success($this->settings->presented($values), 'Image uploaded successfully');
    }

    /** DELETE /admin/settings/images/{key} */
    public function deleteImage(string $key): JsonResponse
    {
        $this->authorize('update', Setting::class);
        $this->ensureImageKey($key);

        return ApiResponse::success($this->settings->presented($this->settings->removeImage($key)), 'Image removed successfully');
    }

    private function ensureImageKey(string $key): void
    {
        abort_unless(in_array($key, $this->settings->imageKeys(), true), 404, 'Unknown image setting.');
    }
}
