<?php

use App\Http\Controllers\DebtorsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettlementController;
use App\Http\Controllers\StatisticsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect('settlements');
    })->name('dashboard');

    Route::prefix('orders')
        ->name('orders.')
        ->group(function () {
            Route::get('', fn () => dd(1))
                ->name('index');
            Route::get('/create', [SettlementController::class, 'create'])
                ->name('create');
            Route::post('/store', [SettlementController::class, 'store'])
                ->name('store');
            Route::get('show/{uuid}', fn () => dd(1))
                ->whereUuid('uuid')
                ->name('show');
            Route::post('update/{uuid}', fn () => dd(1))
                ->whereUuid('uuid')
                ->name('update');
        });

    Route::prefix('settlements')->name('settlements.')->group(function () {
        Route::get('/', [SettlementController::class, 'index'])->name('index');
        Route::get('/create', [SettlementController::class, 'create'])->name('create');
        Route::post('/store', [SettlementController::class, 'store'])->name('store');
        Route::get('/show/{settlement}', [SettlementController::class, 'show'])->name('show');

//        Route::post('/settlements/{settlement}/items', [SettlementController::class, 'storeItem'])->name('items.store');
        Route::delete('/settlements/items/{id}', [SettlementController::class, 'destroyItem'])->name('items.destroy');
        Route::post('/markAsPaid/{id}', [SettlementController::class, 'markAsPaid'])->name('items.markAsPaid');
        Route::post('/bulkMarkAsPaid/', [SettlementController::class, 'bulkMarkAsPaid'])->name('items.bulkMarkAsPaid');


    });

    Route::get('my-debts', [\App\Http\Controllers\MyDebtsController::class, 'index'])->name('my.debts');

    Route::get('/debtors', [DebtorsController::class, 'index'])->name('debtors');

    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics');


    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
