<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResumeResource;
use App\Http\Responses\ApiResponse;
use App\Services\ResumeService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ResumeController extends Controller
{
    public function __construct(private readonly ResumeService $resumes) {}

    public function show(): JsonResponse
    {
        $resume = $this->resumes->current();

        return ApiResponse::success(
            $resume ? new ResumeResource($resume) : null,
            $resume ? 'Resume fetched successfully' : 'No resume has been published yet',
            ['available' => $resume !== null],
        );
    }

    public function download(): StreamedResponse
    {
        $resume = $this->resumes->current();

        if (! $resume || ! $this->resumes->exists($resume)) {
            throw new NotFoundHttpException('Resume not available.');
        }

        return $this->resumes->download($resume);
    }
}
