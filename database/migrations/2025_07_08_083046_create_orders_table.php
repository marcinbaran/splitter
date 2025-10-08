<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up() : void {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('place_id')
                ->index();
            $table->unsignedBigInteger('user_id')
                ->index();
            $table->unsignedBigInteger('settlement_id')
                ->nullable()
                ->index();
            $table->string('uuid', 36)
                ->index();
            $table->text('menu_url')
                ->nullable();
            $table->date('date');
            $table->tinyInteger('status')
                ->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down() : void {
        Schema::dropIfExists('orders');
    }
};
