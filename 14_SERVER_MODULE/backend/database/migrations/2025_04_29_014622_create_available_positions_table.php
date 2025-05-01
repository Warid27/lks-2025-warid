<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('available_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_vacancy_id')->constrained("job_vacancies")->cascadeOnDelete();

            // $table->unsignedBigInteger('job_vacancy_id');
            // $table->foreign('job_vacancy_id')->references('id')->on('job_vacancies');

            $table->string('position');
            $table->bigInteger('capacity');
            $table->bigInteger('apply_capacity');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('available_positions');
    }
};
