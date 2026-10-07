<?php

namespace App\Models;

use App\Enums\MessageStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'phone', 'subject', 'message', 'status',
        'ip_address', 'user_agent', 'read_at', 'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => MessageStatus::class,
            'read_at' => 'datetime',
            'replied_at' => 'datetime',
        ];
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $like = '%'.addcslashes($term, '%_\\').'%';

        return $query->where(fn (Builder $q) => $q
            ->where('name', 'like', $like)
            ->orWhere('email', 'like', $like)
            ->orWhere('subject', 'like', $like));
    }

    /** Applies a status transition and keeps the timestamp columns in sync. */
    public function transitionTo(MessageStatus $status): void
    {
        $this->status = $status;

        match ($status) {
            MessageStatus::New => $this->read_at = null,
            MessageStatus::Read => $this->read_at ??= now(),
            MessageStatus::Replied => [$this->read_at ??= now(), $this->replied_at ??= now()],
            MessageStatus::Archived => $this->read_at ??= now(),
        };

        $this->save();
    }
}
