<?php

namespace App\Http\Controllers;

use App\Models\SettlementItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $year = $request->input('year', date('Y'));

        $baseQuery = SettlementItem::where('settlement_items.user_id', $user->id)
            ->whereYear('settlement_items.created_at', $year)
            ->whereNull('settlement_items.deleted_at');

        $paymentStats = (clone $baseQuery)->select(
            DB::raw('CAST(SUM(CASE WHEN status = "paid" THEN final_amount ELSE 0 END) AS DECIMAL(10,2)) as paid_amount'),
            DB::raw('CAST(SUM(CASE WHEN status = "unpaid" THEN final_amount ELSE 0 END) AS DECIMAL(10,2)) as unpaid_amount'),
            DB::raw('COUNT(CASE WHEN status = "paid" THEN 1 END) as paid_count'),
            DB::raw('COUNT(CASE WHEN status = "unpaid" THEN 1 END) as unpaid_count')
        )->first();

        $monthlyStats = (clone $baseQuery)
            ->select(
                DB::raw('MONTH(settlement_items.created_at) as month'),
                DB::raw('CAST(SUM(CASE WHEN status = "paid" THEN final_amount ELSE 0 END) AS DECIMAL(10,2)) as paid_amount'),
                DB::raw('CAST(SUM(CASE WHEN status = "unpaid" THEN final_amount ELSE 0 END) AS DECIMAL(10,2)) as unpaid_amount')
            )
            ->groupBy(DB::raw('MONTH(settlement_items.created_at)'))
            ->get()
            ->map(function($item) {
                return [
                    'month' => (int)$item->month,
                    'paid_amount' => (float)$item->paid_amount,
                    'unpaid_amount' => (float)$item->unpaid_amount
                ];
            });

        $availableYears = SettlementItem::where('settlement_items.user_id', $user->id)
            ->select(DB::raw('DISTINCT YEAR(settlement_items.created_at) as year'))
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->map(function($year) {
                return (int)$year;
            });

        return Inertia::render('statistics/index', [
            'stats' => [
                'paidAmount' => (float)$paymentStats->paid_amount,
                'unpaidAmount' => (float)$paymentStats->unpaid_amount,
                'paidCount' => (int)$paymentStats->paid_count,
                'unpaidCount' => (int)$paymentStats->unpaid_count,
                'monthlyStats' => $monthlyStats
            ],
            'filters' => [
                'year' => $year,
            ],
            'availableYears' => $availableYears,
        ]);
    }
}
