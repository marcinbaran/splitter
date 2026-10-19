<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMail extends Command
{
    protected $signature = 'app:test-mail {email? : Adres e-mail odbiorcy}';

    protected $description = 'Wysyła testową wiadomość e-mail na podany adres';

    public function handle(): int
    {
        $recipient = $this->argument('email') ?? 'mrevib@gmail.com';

        $this->info("Wysyłanie wiadomości testowej do: {$recipient}...");

        try {
            Mail::raw('Cześć! To jest testowa wiadomość wysłana z aplikacji Laravel.', function ($message) use ($recipient) {
                $message->to($recipient)
                    ->subject('Testowa wiadomość z Laravela');
            });

            $this->info('Wiadomość została pomyślnie wysłana!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Błąd podczas wysyłania maila: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
