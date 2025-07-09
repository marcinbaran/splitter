<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up() : void {
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('type');
            $table->text('logo_url')
                ->nullable();
            $table->text('menu_url')
                ->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down() : void {
        Schema::dropIfExists('places');
    }
};
