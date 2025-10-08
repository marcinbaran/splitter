<?php

namespace App\Console\Commands;

use App\Mail\WeeklyRemainder;
use App\Models\SettlementItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class RemindDebts extends Command
{
    protected $signature = 'app:remind-debts';

    protected $description = 'Command description';

    public function handle()
    {
        $debts = SettlementItem::with(['user'])
            ->where('status', 'unpaid')
            ->get()
            ->groupBy('user_id')
            ->map(function ($items, $userId) {
                $user = $items->first()->user;
                $totalAmount = $items->sum('final_amount');

                return [
                    'user' => $user,
                    'total_amount' => $totalAmount,
                    'items_count' => $items->count()
                ];
            });

        foreach ($debts as $debt) {
            Mail::to($debt['user']->email)->send(new WeeklyRemainder($debt));
//            echo "Witaj {$debt['user']->name}. Masz łączny dług na kwotę: {$debt['total_amount']}\n";
        }
    }
}
