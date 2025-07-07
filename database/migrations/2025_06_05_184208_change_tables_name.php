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
        Schema::rename('orders', 'settlements');
        Schema::rename('order_items', 'settlement_items');

        Schema::table('settlement_items', function (Blueprint $table) {
            $table->renameColumn('order_id', 'settlement_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('settlements', 'orders');
        Schema::rename('settlement_items', 'order_items');

        Schema::table('order_items', function (Blueprint $table) {
            $table->renameColumn('settlement_id', 'order_id');
        });
    }
};
