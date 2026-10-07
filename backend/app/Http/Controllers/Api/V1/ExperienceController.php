<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExperienceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;

class ExperienceController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return ApiResponse::success(
            ExperienceResource::collection(Experience::query()->ordered()->get()),
            'Experience fetched successfully',
        );
    }
}
