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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount', 20, 8); // Decimalni tip za iznose, prilagodite preciznost po potrebi
            $table->string('sender');
            $table->string('receiver');
            $table->string('transaction_hash')->unique();
            $table->foreignId('contract_id')->constrained()->onDelete('cascade'); // Obezbeđuje da je contract_id vezan za postojeci ugovor u contracts tabeli
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
