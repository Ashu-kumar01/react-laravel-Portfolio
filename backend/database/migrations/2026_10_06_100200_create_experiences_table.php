<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            // 'work' entries form the experience timeline, 'education' the education section.
            $table->string('type', 20)->default('work')->index();
            $table->string('company', 160);
            $table->string('position', 160);
            $table->string('location', 160)->nullable();
            $table->string('employment_type', 40)->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->json('responsibilities')->nullable();
            $table->json('technologies')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};
