<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\MessageStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Http\Responses\ApiResponse;
use App\Models\ContactMessage;
use App\Services\ContactMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    public function __construct(private readonly ContactMessageService $messages) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ContactMessage::class);

        $request->validate([
            'status' => ['nullable', Rule::in(MessageStatus::values())],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $messages = ContactMessage::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->search($request->string('search')->toString())
            ->latest()
            ->latest('id')
            ->paginate($this->perPage($request->integer('per_page'), 15))
            ->withQueryString();

        return ApiResponse::paginated($messages, ContactMessageResource::class, 'Messages fetched successfully', [
            'counts' => $this->messages->counts(),
        ]);
    }

    /** Opening a new message marks it as read. */
    public function show(ContactMessage $message): JsonResponse
    {
        $this->authorize('view', $message);

        if ($message->status === MessageStatus::New) {
            $message->transitionTo(MessageStatus::Read);
        }

        return ApiResponse::success(new ContactMessageResource($message), 'Message fetched successfully');
    }

    public function updateStatus(Request $request, ContactMessage $message): JsonResponse
    {
        $this->authorize('update', $message);

        $validated = $request->validate(['status' => ['required', Rule::enum(MessageStatus::class)]]);
        $message->transitionTo(MessageStatus::from($validated['status']));

        return ApiResponse::success(new ContactMessageResource($message), 'Message marked as '.$message->status->value);
    }

    public function destroy(ContactMessage $message): JsonResponse
    {
        $this->authorize('delete', $message);
        $message->delete();

        return ApiResponse::success(null, 'Message deleted successfully');
    }
}
