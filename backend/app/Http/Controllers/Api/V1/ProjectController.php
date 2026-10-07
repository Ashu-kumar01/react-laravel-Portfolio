<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Responses\ApiResponse;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category' => ['nullable', 'string', 'max:80'],
            'featured' => ['nullable', 'boolean'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $projects = Project::query()
            ->published()
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))
            ->when($request->boolean('featured'), fn ($q) => $q->where('featured', true))
            ->search($request->string('search')->toString())
            ->ordered()
            ->paginate($this->perPage($request->integer('per_page'), 12, 50))
            ->withQueryString();

        $categories = Project::query()->published()->distinct()->orderBy('category')->pluck('category');

        return ApiResponse::paginated($projects, ProjectResource::class, 'Projects fetched successfully', [
            'categories' => $categories,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::query()->published()->where('slug', $slug)->firstOrFail();

        return ApiResponse::success(new ProjectResource($project), 'Project fetched successfully', [
            'related' => ProjectResource::collection($project->related())->resolve(request()),
        ]);
    }
}
