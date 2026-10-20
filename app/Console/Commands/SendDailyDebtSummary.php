<?php

namespace App\Console\Commands;

use App\Mail\DailyDebtSummary;
use App\Models\SettlementItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDailyDebtSummary extends Command
{
    protected $signature = 'app:send-daily-debt-summary';

    protected $description = 'Wysyła użytkownikom dzienne podsumowanie ich należności i wierzytelności';

    public function handle(): int
    {
        $summaries = [];

        SettlementItem::query()
            ->with(['user', 'createdBy'])
            ->where('status', 'unpaid')
            ->get()
            ->each(function (SettlementItem $item) use (&$summaries): void {
                $debtor = $item->user;
                $creditor = $item->createdBy;

                if (!$debtor || !$creditor || $debtor->is($creditor)) {
                    return;
                }

                $amount = (float) $item->final_amount;

                $summaries[$debtor->id] ??= [
                    'user' => $debtor,
                    'owed_to' => [],
                    'owed_by' => [],
                ];
                $summaries[$creditor->id] ??= [
                    'user' => $creditor,
                    'owed_to' => [],
                    'owed_by' => [],
                ];

                $summaries[$debtor->id]['owed_to'][$creditor->id] = $this->addDebt(
                    $summaries[$debtor->id]['owed_to'][$creditor->id] ?? null,
                    $creditor,
                    $amount,
                );
                $summaries[$creditor->id]['owed_by'][$debtor->id] = $this->addDebt(
                    $summaries[$creditor->id]['owed_by'][$debtor->id] ?? null,
                    $debtor,
                    $amount,
                );
            });

        foreach ($summaries as $summary) {
            Mail::to($summary['user']->email)->send(new DailyDebtSummary($summary));
            $this->line("Wysłano podsumowanie do {$summary['user']->email}");
        }

        $this->info('Wysłano podsumowania: '.count($summaries));

        return self::SUCCESS;
    }

    private function addDebt(?array $debt, $user, float $amount): array
    {
        return [
            'user' => $user,
            'amount' => ($debt['amount'] ?? 0) + $amount,
            'items_count' => ($debt['items_count'] ?? 0) + 1,
        ];
    }
}
