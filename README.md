NODE_OPTIONS="--max-old-space-size=8192" npm run build
## Uruchomienie w istniejącym Docker Compose

Splitter jest przygotowany jako dodatkowy plik Compose. Nie uruchamia własnego MySQL ani Redis — korzysta z usług `mysql` i `redis` z istniejącego stacka.

1. Skopiuj `docker-compose.splitter.yml` do katalogu, w którym znajduje się główny `docker-compose.yml`.
2. Ustaw zmienne wymagane przez Compose, minimum:

   ```bash
   export SPLITTER_APP_KEY="base64:..."
   export SPLITTER_APP_URL="http://twoja-domena"
   ```

   `SPLITTER_APP_KEY` możesz wygenerować poleceniem `php artisan key:generate --show`.
   Ustaw również `SPLITTER_MAIL_USERNAME`, `SPLITTER_MAIL_PASSWORD` oraz `SPLITTER_MAIL_FROM_ADDRESS`, jeśli raporty mają być wysyłane przez SMTP.
3. Uruchom oba pliki razem:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.splitter.yml up -d --build
   ```

Aplikacja będzie dostępna na porcie `8085`. Kontener `splitter-scheduler` pilnuje codziennego raportu o 09:00, a `splitter-queue` obsługuje kolejkę.
