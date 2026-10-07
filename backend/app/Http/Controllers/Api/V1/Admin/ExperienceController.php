<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ExperienceRequest;
use App\Http\Resources\ExperienceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Experience::class);

        $experiences = Experience::query()
            ->when(in_array($request->input('type'), Experience::TYPES, true), fn ($q) => $q->where('type', $request->input('type')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $like = '%'.addcslashes($request->string('search')->limit(100, '')->toString(), '%_\\').'%';
                $q->where(fn ($w) => $w->where('company', 'like', $like)->orWhere('position', 'like', $like));
            })
            ->ordered()
            ->paginate($this->perPage($request->integer('per_page'), 15))
            ->withQueryString();

        return ApiResponse::paginated($experiences, ExperienceResource::class, 'Experience fetched successfully');
    }

    public function store(ExperienceRequest $request): JsonResponse
    {
        $experience = Experience::query()->create($request->payload());

        return ApiResponse::success(new ExperienceResource($experience), 'Experience created successfully', [], 201);
    }

    public function show(Experience $experience): JsonResponse
    {
        $this->authorize('view', $experience);

        return ApiResponse::success(new ExperienceResource($experience), 'Experience fetched successfully');
    }

    public function update(ExperienceRequest $request, Experience $experience): JsonResponse
    {
        $experience->update($request->payload());

        return ApiResponse::success(new ExperienceResource($experience), 'Experience updated successfully');
    }

    public function destroy(Experience $experience): JsonResponse
    {
        $this->authorize('delete', $experience);
        $experience->delete();

        return ApiResponse::success(null, 'Experience deleted successfully');
    }
}
