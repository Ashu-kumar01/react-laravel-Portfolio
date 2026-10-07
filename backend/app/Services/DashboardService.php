<?php

namespace App\Services;

use App\Enums\MessageStatus;
use App\Enums\ProjectStatus;
use App\Models\ContactMessage;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Service;
use App\Models\Technology;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function __construct(
        private readonly ContactMessageService $messages,
        private readonly ResumeService $resumes,
    ) {}

    public function summary(): array
    {
        $resume = $this->resumes->current();

        return [
            'stats' => [
                'projects' => Project::query()->count(),
                'published_projects' => Project::query()->where('status', ProjectStatus::Published)->count(),
                'featured_projects' => Project::query()->where('featured', true)->count(),
                'technologies' => Technology::query()->count(),
                'active_technologies' => Technology::query()->where('is_active', true)->count(),
                'experiences' => Experience::query()->count(),
                'services' => Service::query()->count(),
                'messages' => ContactMessage::query()->count(),
                'unread_messages' => ContactMessage::query()->where('status', MessageStatus::New)->count(),
                'resume_downloads' => $resume?->download_count ?? 0,
            ],
            'charts' => [
                'messages_per_month' => $this->messagesPerMonth(6),
                'messages_by_status' => $this->messages->counts(),
                'technologies_by_category' => Technology::query()
                    ->selectRaw('category, COUNT(*) as aggregate')
                    ->groupBy('category')
                    ->orderBy('category')
                    ->pluck('aggregate', 'category')
                    ->map(fn ($v) => (int) $v),
                'projects_by_category' => Project::query()
                    ->selectRaw('category, COUNT(*) as aggregate')
                    ->groupBy('category')
                    ->orderByDesc('aggregate')
                    ->pluck('aggregate', 'category')
                    ->map(fn ($v) => (int) $v),
            ],
            'recent_messages' => ContactMessage::query()
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'email', 'subject', 'status', 'created_at']),
            'resume' => $resume ? [
                'title' => $resume->title,
                'updated_at' => $resume->updated_at?->toIso8601String(),
            ] : null,
        ];
    }

    /** @return list<array{month: string, label: string, count: int}> */
    private function messagesPerMonth(int $months): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths($months - 1);

        $dates = ContactMessage::query()
            ->where('created_at', '>=', $start)
            ->pluck('created_at')
            ->countBy(fn (Carbon $date) => $date->format('Y-m'));

        $series = [];
        for ($i = 0; $i < $months; $i++) {
            $month = $start->copy()->addMonths($i);
            $series[] = [
                'month' => $month->format('Y-m'),
                'label' => $month->format('M'),
                'count' => (int) ($dates[$month->format('Y-m')] ?? 0),
            ];
        }

        return $series;
    }
}
