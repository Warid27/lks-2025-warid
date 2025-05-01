<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_apply_positions', function (Blueprint $table) {
            $table->id();
            $table->date('date');

            $table->foreignId('society_id')->constrained("societies")->cascadeOnDelete();
            $table->foreignId('job_vacancy_id')->constrained("job_vacancies")->cascadeOnDelete();
            $table->foreignId('position_id')->constrained("available_positions")->cascadeOnDelete();
            $table->foreignId('job_apply_society_id')->constrained("job_apply_societies")->cascadeOnDelete();
            $table->timestamps();

            // $table->unsignedBigInteger('society_id');
            // $table->foreign('society_id')->references('id')->on('societies');
            // $table->unsignedBigInteger('job_vacancy_id');
            // $table->foreign('job_vacancy_id')->references('id')->on('job_vacancies');
            // $table->unsignedBigInteger('position_id');
            // $table->foreign('position_id')->references('id')->on('available_positions');
            // $table->unsignedBigInteger('job_apply_society_id');
            // $table->foreign('job_apply_society_id')->references('id')->on('job_apply_societies');



            $table->enum('status', ['pending', 'accepted', 'rejected']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_apply_positions');
    }
};
