<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Tygodniowe podsumowanie rozliczeń</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1017;color:#e2e8f0;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Masz nieopłacone rozliczenia w Splitterze.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0b1017" style="background-color:#0b1017;">
    <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#111a25;border:1px solid #1e293b;border-radius:20px;overflow:hidden;">
            <tr><td style="padding:28px 32px 24px;background:linear-gradient(135deg,#2b1820 0%,#111a25 65%);border-bottom:1px solid #1e293b;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#fb7185;">Splitter</td><td align="right" style="font-size:12px;color:#94a3b8;">{{ now('Europe/Warsaw')->format('d.m.Y') }}</td></tr></table>
                <h1 style="margin:18px 0 8px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-0.5px;color:#f8fafc;">Tygodniowe przypomnienie</h1>
                <p style="margin:0;font-size:15px;line-height:23px;color:#94a3b8;">Masz rozliczenia, które nadal czekają na opłacenie.</p>
            </td></tr>
            <tr><td style="padding:30px 32px;">
                <p style="margin:0 0 22px;font-size:16px;line-height:25px;color:#cbd5e1;">Cześć, <strong style="color:#f8fafc;">{{ $debt['user']->name }}</strong>!</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #3f2530;border-radius:14px;background-color:#20161d;"><tr><td align="center" style="padding:26px 20px;"><div style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#fda4af;">Do uregulowania</div><div style="margin-top:8px;font-size:34px;line-height:40px;font-weight:700;letter-spacing:-1px;color:#f8fafc;">{{ number_format($debt['total_amount'], 2, ',', ' ') }} zł</div><div style="margin-top:8px;font-size:13px;color:#94a3b8;">{{ $debt['items_count'] }} {{ $debt['items_count'] === 1 ? 'nieopłacone rozliczenie' : 'nieopłaconych rozliczeń' }}</div></td></tr></table>
                <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#94a3b8;">Zajrzyj do aplikacji, aby sprawdzić szczegóły i oznaczyć opłacone pozycje.</p>
            </td></tr>
            <tr><td style="padding:0 32px 30px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#5eead4" style="border-radius:10px;background-color:#5eead4;"><a href="{{ route('my.debts') }}" style="display:inline-block;padding:13px 20px;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;color:#0b1017;">Przejdź do rozliczeń&nbsp; →</a></td></tr></table></td></tr>
            <tr><td style="padding:18px 32px;background-color:#0f172a;border-top:1px solid #1e293b;font-size:12px;line-height:18px;color:#64748b;">Wiadomość wygenerowana automatycznie przez Splitter.</td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>
