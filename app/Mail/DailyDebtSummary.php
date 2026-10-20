<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyDebtSummary extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $summary)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Splitter - Dzienne podsumowanie rozliczeń');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.daily_debt_summary');
    }

    public function attachments(): array
    {
        return [];
    }
}
