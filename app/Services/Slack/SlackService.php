<?php

namespace App\Services\Slack;

use App\Models\User;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class SlackService {
    private string|null $botToken;
    private string|null $webhookUrl;

    public function __construct() {
        $this->botToken = config('slack.bot_token');
        $this->webhookUrl = config('slack.webhook_url');
    }

    public function getUserId(#[\SensitiveParameter] string $email) : string|null {
        $response = $this->slackClient()
            ->get('https://slack.com/api/users.lookupByEmail?email=' . $email);

        if ($response->successful()) {
            return $response->json()['user']['id'] ?? null;
        }

        return null;
    }

    public function sendWebhook(string $text, array $blocks = []) : bool {
        $response = Http::withBody(
            json_encode([
                'text' => $text,
                'blocks' => $blocks,
            ]),
            'application/json'
        )
            ->post($this->webhookUrl);

        return $response->successful();
    }

    public function openDirectChannel(string $userId): string|null {
        $response = $this->slackClient()
            ->post('https://slack.com/api/conversations.open', [
                'users' => $userId
            ]);

        if ($response->successful() && $response->json('ok')) {
            return $response->json('channel.id');
        }

        return null;
    }

    public function sendDirectMessage(User $user, string $text, array $blocks = []) : bool|null {
        if (!$user->slack_id) {
            return null;
        }

        $channel = $this->openDirectChannel(
            $user->slack_id
        );

        if (!$channel) {
            return null;
        }

        $response = $this->slackClient()
            ->withBody(
                json_encode([
                    'channel' => $user->slack_id,
                    'text' => $text,
                    'blocks' => $blocks,
                ]),
                'application/json'
            )
            ->post('https://slack.com/api/chat.postMessage');

        return $response->successful();
    }

    private function slackClient() : PendingRequest {
        return Http::withToken($this->botToken);
    }
}
