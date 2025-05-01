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
        Schema::create('validations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_category_id');
            $table->unsignedBigInteger('society_id');
            $table->unsignedBigInteger('validator_id');

            $table->foreign('job_category_id')->references('id')->on('job_categories');
            $table->foreign('society_id')->references('id')->on('societies');
            $table->foreign('validator_id')->references('id')->on('validators')->nullable();

            $table->enum('status', ['accepted', 'declined', 'pending']);
            $table->text('work_experience')->nullable();
            $table->text('job_position');
            $table->text('reason_accepted');
            $table->text('validator_notes')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('validations');
    }
};
