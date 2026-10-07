<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::select('select 1');
            $database = 'ok';
        } catch (Throwable) {
            $database = 'unavailable';
        }

        return ApiResponse::success([
            'status' => $database === 'ok' ? 'operational' : 'degraded',
            'database' => $database,
            'version' => 'v1',
            'time' => now()->toIso8601String(),
        ], 'API is running', [], $database === 'ok' ? 200 : 503);
    }
}
