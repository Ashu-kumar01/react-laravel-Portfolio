<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\TechnologyCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TechnologyRequest;
use App\Http\Resources\TechnologyResource;
use App\Http\Responses\ApiResponse;
use App\Models\Technology;
use App\Services\TechnologyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TechnologyController extends Controller
{
    public function __construct(private readonly TechnologyService $technologies) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Technology::class);

        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', Rule::enum(TechnologyCategory::class)],
            'active' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $technologies = Technology::query()
            ->search($request->string('search')->toString())
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->input('category')))
            ->when($request->filled('active'), fn ($q) => $q->where('is_active', $request->boolean('active')))
            ->orderBy('category')
            ->ordered()
            ->paginate($this->perPage($request->integer('per_page'), 15))
            ->withQueryString();

        return ApiResponse::paginated($technologies, TechnologyResource::class, 'Technologies fetched successfully', [
            'categories' => collect(TechnologyCategory::cases())->map(fn ($c) => ['key' => $c->value, 'label' => $c->label()]),
        ]);
    }

    public function store(TechnologyRequest $request): JsonResponse
    {
        $technology = $this->technologies->create($request->validated());

        return ApiResponse::success(new TechnologyResource($technology), 'Technology created successfully', [], 201);
    }

    public function show(Technology $technology): JsonResponse
    {
        $this->authorize('view', $technology);

        return ApiResponse::success(new TechnologyResource($technology), 'Technology fetched successfully');
    }

    public function update(TechnologyRequest $request, Technology $technology): JsonResponse
    {
        $technology = $this->technologies->update($technology, $request->validated());

        return ApiResponse::success(new TechnologyResource($technology), 'Technology updated successfully');
    }

    public function destroy(Technology $technology): JsonResponse
    {
        $this->authorize('delete', $technology);
        $this->technologies->delete($technology);

        return ApiResponse::success(null, 'Technology deleted successfully');
    }
}
