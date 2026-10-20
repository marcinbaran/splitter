<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dzienne podsumowanie rozliczeń</title>
</head>
<body style="margin:0;padding:24px;background:#f6f9fc;color:#333;font-family:Arial,sans-serif;line-height:1.5">
<div style="max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:12px">
    <h1 style="margin-top:0">Dzienne podsumowanie rozliczeń</h1>
    <p>Cześć {{ $summary['user']->name }}!</p>
    <p>Stan niezapłaconych rozliczeń na {{ now('Europe/Warsaw')->format('d.m.Y') }}:</p>

    @if(count($summary['owed_to']) > 0)
        <h2>Ty jesteś winien</h2>
        <ul>
            @foreach($summary['owed_to'] as $debt)
                <li><strong>{{ $debt['user']->name }}</strong> — {{ number_format($debt['amount'], 2, ',', ' ') }} zł</li>
            @endforeach
        </ul>
    @endif

    @if(count($summary['owed_by']) > 0)
        <h2>Winni Tobie</h2>
        <ul>
            @foreach($summary['owed_by'] as $debt)
                <li><strong>{{ $debt['user']->name }}</strong> — {{ number_format($debt['amount'], 2, ',', ' ') }} zł</li>
            @endforeach
        </ul>
    @endif

    <p style="color:#718096;font-size:14px;margin-top:28px">Wiadomość wygenerowana automatycznie.</p>
</div>
</body>
</html>
