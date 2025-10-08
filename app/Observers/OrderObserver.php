<?php

namespace App\Observers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\Slack\SlackService;
use Illuminate\Support\Str;

readonly class OrderObserver {
    public function __construct(
        private SlackService $slackService
    ) {}

    public function creating(Order $order) : void {
        $order->uuid = Str::uuid();
    }

    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order) : void {
        $this->sendNotification(
            $order,
            'Nowe zamówienie w '.$order->place->name . '.',
            [
                '@here',
                'Zamówienie *#' . $order->uuid . '* w ' . $order->place->type->label() . ' zostało utworzone.',
                '*<' . $order->url . '|' . $order->place->name . '>*'
            ]
        );
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order) : void {
        $notification = match ($order->status) {
            OrderStatus::Open => [
                'title' => 'Zamówienie w '.$order->place->name . ' zostało otwarte.',
                'text' => [
                    '@here',
                    'Zamówienie *#' . $order->uuid . '* zostało otwarte.',
                    '*<' . $order->url . '|' . $order->place->name . '>*',
                ],
            ],
            OrderStatus::Locked => [
                'title' => 'Zamówienie w '.$order->place->name . ' zostało zamknięte.',
                'text' => [
                    '@here',
                    'Dodawanie pozycji w zamówieniu *#' . $order->uuid . '* zostało zablokowane.',
                ],
            ],
            OrderStatus::Finished => [
                'title' => 'Zamówienie w '.$order->place->name . ' zostało wysłane.',
                'text' => [
                    '@here',
                    'Zamówienie *#' . $order->uuid . '* zostało wysłane do realizacji.',
                ],
            ],
            OrderStatus::Delivered => [
                'title' => 'Zamówienie w '.$order->place->name . ' zostało dostarczone.',
                'text' => [
                    '@here',
                    'Zamówienie *#' . $order->uuid . '* zostało dostarczone.',
                ],
            ],
            OrderStatus::Cancelled => [
                'title' => 'Zamówienie w '.$order->place->name . ' zostało anulowane.',
                'text' => [
                    '@here',
                    'Zamówienie *#' . $order->uuid . '* zostało anulowane.',
                ],
            ],
            default => null,
        };

        if ($notification) {
            $this->sendNotification($order, $notification['title'], $notification['text']);
        }
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order) : void {
        //
    }

    /**
     * Handle the Order "restored" event.
     */
    public function restored(Order $order) : void {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public function forceDeleted(Order $order) : void {
        //
    }

    private function sendNotification(Order $order, string $title, array $text) : void {
        $this
            ->slackService
            ->sendWebhook(
                $title,
                [
                    [
                        'type' => 'section',
                        'block_id' => 'section567',
                        'text' => [
                            'type' => 'mrkdwn',
                            'text' => implode("\n", $text),
                        ],
                        'accessory' => $order->place->slackAccessory(),
                    ],
                ]
            );
    }
}
