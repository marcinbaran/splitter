<?php

namespace App\Http\Controllers;

use App\Models\SettlementItem;
use Inertia\Inertia;

class DebtorsController extends Controller
{
    public function index()
    {
        $orders = SettlementItem::where('created_by', auth()->user()->id)
            ->where('status', 'unpaid')
            ->with(['order', 'user'])
            ->get();

        return Inertia::render('debtors/index', ['settlements' => $orders]);
    }
}
