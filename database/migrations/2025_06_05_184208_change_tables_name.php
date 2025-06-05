<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('settlements', 'settlements');
        Schema::rename('order_items', 'settlement_items');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('settlements', 'settlements');
        Schema::rename('settlement_items', 'order_items');
    }
};
