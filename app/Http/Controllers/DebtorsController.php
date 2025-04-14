<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Inertia\Inertia;

class DebtorsController extends Controller
{
    public function index()
    {
        $orders = OrderItem::where('created_by', auth()->user()->id)
            ->where('status', 'unpaid')
            ->with(['order', 'user'])
            ->get();

        return Inertia::render('debtors/index', ['orders' => $orders]);
    }
}
