<?php

namespace App\Http\Controllers;

use App\Models\SettlementItem;
use Inertia\Inertia;

class DebtorsController extends Controller
{
    public function index()
    {
        $settlements = SettlementItem::where('created_by', auth()->user()->id)
            ->where('status', 'unpaid')
            ->with(['settlement', 'user'])
            ->get();

        return Inertia::render('debtors/index', ['settlements' => $settlements]);
    }
}
