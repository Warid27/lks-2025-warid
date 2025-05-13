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
        Schema::create('installment_apply_statuses', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('society_id')->constrained('societies')->cascadeOnDelete();
            $table->foreignId('installment_id')->constrained('installment')->cascadeOnDelete()->nullable();
            $table->foreignId('available_month_id')->constrained('available_months')->cascadeOnDelete()->nullable();
            $table->foreignId('installment_apply_societies_id')
                ->constrained('installment_apply_societies')
                ->cascadeOnDelete()
                ->nullable()
                ->name('apply_statuses_society_id_fk');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_apply_statuses');
    }
};
