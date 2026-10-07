<?php

use App\Http\Controllers\Api\V1;
use App\Http\Controllers\Api\V1\Admin;
use App\Http\Responses\ApiResponse;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->middleware('throttle:api')->group(function () {

    /*
    | Public portfolio endpoints (read-only, plus the contact form)
    */
    Route::get('health', V1\HealthController::class)->name('health');
    Route::get('profile', V1\ProfileController::class)->name('profile');
    Route::get('projects', [V1\ProjectController::class, 'index'])->name('projects.index');
    Route::get('projects/{slug}', [V1\ProjectController::class, 'show'])->name('projects.show')
        ->where('slug', '[A-Za-z0-9\-_]+');
    Route::get('technologies', V1\TechnologyController::class)->name('technologies');
    Route::get('experience', V1\ExperienceController::class)->name('experience');
    Route::get('services', V1\ServiceController::class)->name('services');
    Route::get('resume', [V1\ResumeController::class, 'show'])->name('resume.show');
    Route::get('resume/download', [V1\ResumeController::class, 'download'])->name('resume.download')
        ->middleware('throttle:downloads');
    Route::post('contact', V1\ContactController::class)->name('contact')->middleware('throttle:contact');

    /*
    | Admin API (Sanctum bearer tokens)
    */
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::post('login', [Admin\AuthController::class, 'login'])->name('login')->middleware('throttle:admin-login');

        Route::middleware(['auth:sanctum', 'admin'])->group(function () {
            Route::post('logout', [Admin\AuthController::class, 'logout'])->name('logout');
            Route::get('me', [Admin\AuthController::class, 'me'])->name('me');
            Route::put('account', [Admin\AccountController::class, 'update'])->name('account.update');
            Route::put('account/password', [Admin\AccountController::class, 'password'])->name('account.password');

            Route::get('dashboard', Admin\DashboardController::class)->name('dashboard');

            Route::apiResource('projects', Admin\ProjectController::class);
            Route::apiResource('technologies', Admin\TechnologyController::class);
            Route::apiResource('experiences', Admin\ExperienceController::class);
            Route::apiResource('services', Admin\ServiceController::class);

            Route::get('messages', [Admin\MessageController::class, 'index'])->name('messages.index');
            Route::get('messages/{message}', [Admin\MessageController::class, 'show'])->name('messages.show');
            Route::patch('messages/{message}/status', [Admin\MessageController::class, 'updateStatus'])->name('messages.status');
            Route::delete('messages/{message}', [Admin\MessageController::class, 'destroy'])->name('messages.destroy');

            Route::get('resume', [Admin\ResumeController::class, 'show'])->name('resume.show');
            Route::post('resume', [Admin\ResumeController::class, 'store'])->name('resume.store');
            Route::get('resume/download', [Admin\ResumeController::class, 'download'])->name('resume.download');
            Route::delete('resume', [Admin\ResumeController::class, 'destroy'])->name('resume.destroy');

            Route::get('settings', [Admin\SettingController::class, 'show'])->name('settings.show');
            Route::put('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
            Route::post('settings/images/{key}', [Admin\SettingController::class, 'uploadImage'])->name('settings.images.store')
                ->where('key', '[a-z_]+');
            Route::delete('settings/images/{key}', [Admin\SettingController::class, 'deleteImage'])->name('settings.images.destroy')
                ->where('key', '[a-z_]+');
        });
    });
});

Route::fallback(fn () => ApiResponse::error('The requested endpoint does not exist.', 404));
