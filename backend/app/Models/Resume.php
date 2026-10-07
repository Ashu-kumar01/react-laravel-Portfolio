<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'file_path', 'original_name', 'mime_type', 'size', 'is_active', 'download_count', 'uploaded_by'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'size' => 'integer',
            'download_count' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopeCurrent(Builder $query): Builder
    {
        return $query->where('is_active', true)->latest('id');
    }
}
