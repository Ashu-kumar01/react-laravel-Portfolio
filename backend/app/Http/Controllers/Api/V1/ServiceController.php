<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Service;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return ApiResponse::success(
            ServiceResource::collection(Service::query()->active()->ordered()->get()),
            'Services fetched successfully',
        );
    }
}
