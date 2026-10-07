<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ServiceIcon;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Service::class);

        $services = Service::query()
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%'.addcslashes($request->string('search')->limit(100, '')->toString(), '%_\\').'%'))
            ->when($request->filled('active'), fn ($q) => $q->where('is_active', $request->boolean('active')))
            ->ordered()
            ->paginate($this->perPage($request->integer('per_page'), 15))
            ->withQueryString();

        return ApiResponse::paginated($services, ServiceResource::class, 'Services fetched successfully', [
            'icons' => ServiceIcon::values(),
        ]);
    }

    public function store(ServiceRequest $request): JsonResponse
    {
        $service = Service::query()->create($request->payload());

        return ApiResponse::success(new ServiceResource($service), 'Service created successfully', [], 201);
    }

    public function show(Service $service): JsonResponse
    {
        $this->authorize('view', $service);

        return ApiResponse::success(new ServiceResource($service), 'Service fetched successfully');
    }

    public function update(ServiceRequest $request, Service $service): JsonResponse
    {
        $service->update($request->payload());

        return ApiResponse::success(new ServiceResource($service), 'Service updated successfully');
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);
        $service->delete();

        return ApiResponse::success(null, 'Service deleted successfully');
    }
}
