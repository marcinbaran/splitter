<?php

namespace App\Mail;

use App\Models\Settlement;
use App\Models\SettlementItem;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SettlementCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Settlement $settlement, public SettlementItem $settlementItem)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Splitter - nowe zamówienie',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.settlement_created',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
