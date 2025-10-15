<?php

namespace App\Http\Controllers;

use App\Models\SettlementItem;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyDebtsController
{
    public function index()
    {
        $myDebts = SettlementItem::with(['createdBy', 'settlement'])
            ->where('user_id', Auth::user()->id)
            ->where('status', 'unpaid')
            ->get();

        return Inertia::render('my-debts/index', [
            'myDebts' => $myDebts->groupBy('created_by')
        ]);
    }
}
