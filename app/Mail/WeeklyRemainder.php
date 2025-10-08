<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WeeklyRemainder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $debt)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Splitter - Tygodniowe podsumowanie',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.weekly_remainder',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
