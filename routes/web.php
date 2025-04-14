<?php

use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('/store', [OrderController::class, 'store'])->name('store');
        Route::get('/show/{orderId}', [OrderController::class, 'show'])->name('show');

        Route::post('/orders/{orderId}/items', [OrderController::class, 'storeItem'])->name('items.store');
        Route::delete('/orders/items/{id}', [OrderController::class, 'destroyItem'])->name('items.destroy');
    });


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
