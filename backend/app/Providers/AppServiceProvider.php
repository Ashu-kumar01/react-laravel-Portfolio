<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();

        Password::defaults(fn () => Password::min(10)->letters()->mixedCase()->numbers()->symbols());

        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by($request->user()?->id ?: $request->ip()));

        // Brute-force protection: per login identifier + IP, and per IP overall.
        RateLimiter::for('admin-login', fn (Request $request) => [
            Limit::perMinute(5)->by(Str::lower((string) $request->input('login')).'|'.$request->ip()),
            Limit::perMinute(20)->by('login-ip|'.$request->ip()),
        ]);

        // Spam protection for the public contact form.
        RateLimiter::for('contact', fn (Request $request) => [
            Limit::perMinute(3)->by('contact-min|'.$request->ip()),
            Limit::perDay(20)->by('contact-day|'.$request->ip()),
        ]);

        RateLimiter::for('downloads', fn (Request $request) => Limit::perMinute(20)->by($request->ip()));
    }
}
