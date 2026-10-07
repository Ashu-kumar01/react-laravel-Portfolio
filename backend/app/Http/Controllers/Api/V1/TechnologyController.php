<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TechnologyCategory;
use App\Http\Controllers\Controller;
use App\Http\Resources\TechnologyResource;
use App\Http\Responses\ApiResponse;
use App\Models\Technology;
use Illuminate\Http\JsonResponse;

class TechnologyController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $categoryOrder = array_flip(TechnologyCategory::values());

        $technologies = Technology::query()->active()->ordered()->get()
            ->sortBy(fn (Technology $t) => $categoryOrder[$t->category->value] ?? 99, SORT_NUMERIC)
            ->values();

        $categories = collect(TechnologyCategory::cases())
            ->map(fn (TechnologyCategory $c) => [
                'key' => $c->value,
                'label' => $c->label(),
                'count' => $technologies->where('category', $c)->count(),
            ])
            ->filter(fn ($c) => $c['count'] > 0)
            ->values();

        return ApiResponse::success(
            TechnologyResource::collection($technologies),
            'Technologies fetched successfully',
            ['categories' => $categories, 'total' => $technologies->count()],
        );
    }
}
