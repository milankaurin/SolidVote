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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address')->unique(); // Ethereum adresa ugovora
            $table->text('abi'); // ABI ugovora, možda ćete želeli koristiti tip `text` zbog potencijalne dužine
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Pretpostavka da već imate users tabelu
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
