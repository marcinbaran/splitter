<?php

use App\Http\Controllers\DebtorsController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StatisticsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect('orders');
    })->name('dashboard');

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/my', [OrderController::class, 'myOrders'])->name('my');
        Route::get('/create', [OrderController::class, 'create'])->name('create');
        Route::post('/store', [OrderController::class, 'store'])->name('store');
        Route::get('/show/{orderId}', [OrderController::class, 'show'])->name('show');

        Route::post('/orders/{orderId}/items', [OrderController::class, 'storeItem'])->name('items.store');
        Route::delete('/orders/items/{id}', [OrderController::class, 'destroyItem'])->name('items.destroy');
        Route::post('/markAsPaid/{id}', [OrderController::class, 'markAsPaid'])->name('items.markAsPaid');
    });

    Route::get('/debtors', [DebtorsController::class, 'index'])->name('debtors');

    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
