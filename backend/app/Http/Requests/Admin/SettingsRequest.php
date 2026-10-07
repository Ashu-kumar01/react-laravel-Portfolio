<?php

namespace App\Http\Requests\Admin;

use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Foundation\Http\FormRequest;

class SettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', Setting::class);
    }

    public function rules(): array
    {
        return app(SettingService::class)->rules();
    }
}
