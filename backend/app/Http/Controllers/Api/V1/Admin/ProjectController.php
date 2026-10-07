<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Responses\ApiResponse;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projects) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(ProjectStatus::values())],
            'category' => ['nullable', 'string', 'max:80'],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(['sort_order', 'title', 'created_at', 'updated_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $sort = $request->input('sort', 'sort_order');
        $direction = $request->input('direction', $sort === 'sort_order' || $sort === 'title' ? 'asc' : 'desc');

        $projects = Project::query()
            ->search($request->string('search')->toString())
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->input('category')))
            ->when($request->filled('featured'), fn ($q) => $q->where('featured', $request->boolean('featured')))
            ->orderBy($sort, $direction)
            ->orderByDesc('id')
            ->paginate($this->perPage($request->integer('per_page'), 10))
            ->withQueryString();

        return ApiResponse::paginated($projects, ProjectResource::class, 'Projects fetched successfully', [
            'categories' => Project::query()->distinct()->orderBy('category')->pluck('category'),
        ]);
    }

    public function store(ProjectRequest $request): JsonResponse
    {
        $project = $this->projects->create($request->validated());

        return ApiResponse::success(new ProjectResource($project), 'Project created successfully', [], 201);
    }

    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return ApiResponse::success(new ProjectResource($project), 'Project fetched successfully');
    }

    public function update(ProjectRequest $request, Project $project): JsonResponse
    {
        $project = $this->projects->update($project, $request->validated());

        return ApiResponse::success(new ProjectResource($project), 'Project updated successfully');
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);
        $this->projects->delete($project);

        return ApiResponse::success(null, 'Project deleted successfully');
    }
}
