<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResumeResource;
use App\Http\Responses\ApiResponse;
use App\Models\Project;
use App\Models\Service;
use App\Models\Technology;
use App\Services\ResumeService;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function __invoke(SettingService $settings, ResumeService $resumes): JsonResponse
    {
        $resume = $resumes->current();

        return ApiResponse::success([
            'profile' => $settings->public(),
            'stats' => [
                'years_experience' => (float) $settings->get('years_experience', 0),
                'websites' => (int) $settings->get('websites_count', 0),
                'projects' => Project::query()->published()->count(),
                'technologies' => Technology::query()->active()->count(),
                'services' => Service::query()->active()->count(),
            ],
            'resume' => $resume ? (new ResumeResource($resume))->resolve(request()) : null,
        ], 'Profile fetched successfully');
    }
}
