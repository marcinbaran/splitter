<?php

namespace App\Http\Controllers;

use App\Models\SettlementItem;
use Inertia\Inertia;
use Inertia\Response;

class DebtorsController extends Controller
{
    public function index(): Response
    {
        $settlements = SettlementItem::where('created_by', auth()->user()->id)
            ->where('status', 'unpaid')
            ->with(['settlement', 'user'])
            ->get()
            ->groupBy('user_id');

        return Inertia::render('debtors/index', ['settlements' => $settlements]);
    }
}
