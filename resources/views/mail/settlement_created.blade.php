<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Nowe zamówienie</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1017;color:#e2e8f0;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Dodano Cię do nowego zamówienia w {{ $settlement->restaurant_name }}.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0b1017" style="background-color:#0b1017;">
    <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#111a25;border:1px solid #1e293b;border-radius:20px;overflow:hidden;">
            <tr><td style="padding:28px 32px 24px;background:linear-gradient(135deg,#122b2d 0%,#111a25 65%);border-bottom:1px solid #1e293b;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#5eead4;">Splitter</td><td align="right" style="font-size:12px;color:#94a3b8;">Nowe zamówienie</td></tr></table>
                <h1 style="margin:18px 0 8px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-0.5px;color:#f8fafc;">Dodano Cię do zamówienia</h1>
                <p style="margin:0;font-size:15px;line-height:23px;color:#94a3b8;">Twoja pozycja czeka na opłacenie.</p>
            </td></tr>
            <tr><td style="padding:30px 32px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #1e293b;border-radius:12px;background-color:#0f172a;">
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#94a3b8;">Restauracja</td><td align="right" style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:14px;font-weight:700;color:#f8fafc;">{{ $settlement->restaurant_name }}</td></tr>
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#94a3b8;">Zniżka</td><td align="right" style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:14px;font-weight:700;color:#fda4af;">{{ number_format($settlement->discount, 2, ',', ' ') }}%</td></tr>
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#94a3b8;">Voucher</td><td align="right" style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:14px;font-weight:700;color:#5eead4;">{{ number_format($settlement->voucher, 2, ',', ' ') }} zł</td></tr>
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#94a3b8;">Dostawa</td><td align="right" style="padding:14px 16px;border-bottom:1px solid #1e293b;font-size:14px;font-weight:700;color:#e2e8f0;">{{ number_format($settlement->delivery, 2, ',', ' ') }} zł</td></tr>
                    <tr><td style="padding:14px 16px;font-size:13px;color:#94a3b8;">Koszt transakcji</td><td align="right" style="padding:14px 16px;font-size:14px;font-weight:700;color:#e2e8f0;">{{ number_format($settlement->transaction, 2, ',', ' ') }} zł</td></tr>
                </table>
            </td></tr>
            <tr><td style="padding:24px 32px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #3f2530;border-radius:14px;background-color:#20161d;"><tr><td align="center" style="padding:24px 20px;"><div style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#fda4af;">Twoja kwota do zapłaty</div><div style="margin-top:8px;font-size:34px;line-height:40px;font-weight:700;letter-spacing:-1px;color:#f8fafc;">{{ number_format($settlementItem->final_amount, 2, ',', ' ') }} zł</div></td></tr></table>
            </td></tr>
            <tr><td style="padding:26px 32px 30px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#5eead4" style="border-radius:10px;background-color:#5eead4;"><a href="{{ route('settlements.show', ['settlement' => $settlement->id]) }}" style="display:inline-block;padding:13px 20px;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;color:#0b1017;">Zobacz szczegóły zamówienia&nbsp; →</a></td></tr></table></td></tr>
            <tr><td style="padding:18px 32px;background-color:#0f172a;border-top:1px solid #1e293b;font-size:12px;line-height:18px;color:#64748b;">Wiadomość wygenerowana automatycznie przez Splitter.</td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>
