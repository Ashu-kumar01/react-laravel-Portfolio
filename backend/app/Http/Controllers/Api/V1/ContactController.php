<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Http\Responses\ApiResponse;
use App\Services\ContactMessageService;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function __invoke(ContactRequest $request, ContactMessageService $messages): JsonResponse
    {
        $successMessage = 'Thank you! Your message has been sent. I will get back to you soon.';

        // Bots that fill the honeypot get an identical response but nothing is stored.
        if ($request->isSpam()) {
            return ApiResponse::success(null, $successMessage, [], 201);
        }

        $message = $messages->store($request->validated(), $request);

        return ApiResponse::success(['id' => $message->id], $successMessage, [], 201);
    }
}
