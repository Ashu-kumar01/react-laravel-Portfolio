<?php

namespace App\Http\Requests\Admin;

use App\Enums\ServiceIcon;
use App\Models\Service;
use App\Support\ListInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $service = $this->route('service');

        return $service instanceof Service
            ? $this->user()->can('update', $service)
            : $this->user()->can('create', Service::class);
    }

    public function rules(): array
    {
        $service = $this->route('service');
        $required = $service instanceof Service ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'max:120', Rule::unique('services', 'title')->ignore($service?->id)],
            'short_description' => [$required, 'string', 'max:300'],
            'description' => ['nullable', 'string', 'max:5000'],
            'icon' => [$required, Rule::enum(ServiceIcon::class)],
            'features' => ['nullable', 'array', 'max:20'],
            'features.*' => ['nullable', 'string', 'max:200'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function payload(): array
    {
        $data = $this->validated();

        return ListInput::cleanKeys($data, ['features']);
    }
}
