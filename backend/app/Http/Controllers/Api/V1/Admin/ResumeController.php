<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResumeRequest;
use App\Http\Resources\AdminResumeResource;
use App\Http\Responses\ApiResponse;
use App\Models\Resume;
use App\Services\ResumeService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ResumeController extends Controller
{
    public function __construct(private readonly ResumeService $resumes) {}

    public function show(): JsonResponse
    {
        $this->authorize('viewAny', Resume::class);
        $resume = $this->resumes->current();

        return ApiResponse::success(
            $resume ? new AdminResumeResource($resume) : null,
            $resume ? 'Resume fetched successfully' : 'No resume uploaded yet',
            ['available' => $resume !== null, 'max_size_kb' => config('portfolio.uploads.resume_max_kb')],
        );
    }

    public function store(ResumeRequest $request): JsonResponse
    {
        $resume = $this->resumes->replace($request->file('file'), $request->input('title'), $request->user());

        return ApiResponse::success(new AdminResumeResource($resume), 'Resume uploaded successfully', [], 201);
    }

    public function download(): StreamedResponse
    {
        $this->authorize('viewAny', Resume::class);
        $resume = $this->resumes->current();

        if (! $resume || ! $this->resumes->exists($resume)) {
            throw new NotFoundHttpException;
        }

        return $this->resumes->download($resume, countDownload: false);
    }

    public function destroy(): JsonResponse
    {
        $this->authorize('delete', Resume::class);
        $resume = $this->resumes->current();

        if (! $resume) {
            throw new NotFoundHttpException;
        }

        $this->resumes->delete($resume);

        return ApiResponse::success(null, 'Resume deleted successfully');
    }
}
