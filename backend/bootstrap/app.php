<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Responses\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [ForceJsonResponse::class]);
        $middleware->api(append: [SecurityHeaders::class]);
        $middleware->alias(['admin' => EnsureUserIsAdmin::class]);
        // This is a token API; there is no HTML login page to redirect to.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $isApi = fn (Request $request) => $request->is('api/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $isApi($request));

        $exceptions->render(function (ValidationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error($e->getMessage(), $e->status, $e->errors());
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('Your session has expired or you are not logged in.', 401);
            }
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('You are not authorized to perform this action.', 403);
            }
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) use ($isApi) {
            if (! $isApi($request)) {
                return null;
            }

            $status = $e->getStatusCode();
            $message = match ($status) {
                403 => 'You are not authorized to perform this action.',
                404 => 'The requested resource was not found.',
                405 => 'This method is not allowed for the requested endpoint.',
                413 => 'The uploaded file is too large.',
                419 => 'Your session has expired. Please refresh and try again.',
                429 => 'Too many requests. Please wait a moment and try again.',
                503 => 'The service is temporarily unavailable.',
                default => $status >= 500 ? 'Something went wrong. Please try again later.' : 'The request could not be processed.',
            };

            return ApiResponse::error($message, $status)->withHeaders($e->getHeaders());
        });

        // Anything else: never leak exception details unless debugging locally.
        $exceptions->render(function (Throwable $e, Request $request) use ($isApi) {
            if (! $isApi($request)) {
                return null;
            }

            $extra = config('app.debug') ? ['debug' => ['exception' => $e::class, 'message' => $e->getMessage()]] : [];

            return ApiResponse::error('Something went wrong. Please try again later.', 500, [], $extra);
        });
    })->create();
