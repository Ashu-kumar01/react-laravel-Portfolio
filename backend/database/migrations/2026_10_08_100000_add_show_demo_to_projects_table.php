<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Whether the public site shows a "View demo" button linking to live_url.
            $table->boolean('show_demo')->default(false)->after('live_url');
        });

        // Keep current behaviour: projects that already have a live URL keep showing it.
        DB::table('projects')->whereNotNull('live_url')->where('live_url', '!=', '')->update(['show_demo' => true]);
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('show_demo');
        });
    }
};
