<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Dzienne podsumowanie rozliczeń</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1017;color:#e2e8f0;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Sprawdź bieżący stan swoich rozliczeń w Splitterze.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0b1017" style="background-color:#0b1017;">
    <tr>
        <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#111a25;border:1px solid #1e293b;border-radius:20px;overflow:hidden;">
                <tr>
                    <td style="padding:28px 32px 24px;background:linear-gradient(135deg,#122b2d 0%,#111a25 65%);border-bottom:1px solid #1e293b;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                                <td style="font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#5eead4;">Splitter</td>
                                <td align="right" style="font-size:12px;color:#94a3b8;">{{ now('Europe/Warsaw')->format('d.m.Y') }}</td>
                            </tr>
                        </table>
                        <h1 style="margin:18px 0 8px;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-0.5px;color:#f8fafc;">Dzienne podsumowanie</h1>
                        <p style="margin:0;font-size:15px;line-height:23px;color:#94a3b8;">Aktualny stan Twoich nieopłaconych rozliczeń.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:30px 32px 12px;">
                        <p style="margin:0;font-size:16px;line-height:25px;color:#cbd5e1;">Cześć, <strong style="color:#f8fafc;">{{ $summary['user']->name }}</strong>!</p>

                        @if(count($summary['owed_to']) > 0)
                            <p style="margin:28px 0 10px;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#fb7185;">Ty jesteś winien</p>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #3f2530;border-radius:12px;background-color:#20161d;">
                                @foreach($summary['owed_to'] as $debt)
                                    <tr>
                                        <td style="padding:15px 16px;{{ !$loop->last ? 'border-bottom:1px solid #3f2530;' : '' }}">
                                            <span style="display:block;font-size:15px;font-weight:700;color:#f8fafc;">{{ $debt['user']->name }}</span>
                                            <span style="display:block;margin-top:3px;font-size:12px;color:#94a3b8;">{{ $debt['items_count'] }} {{ $debt['items_count'] === 1 ? 'rozliczenie' : 'rozliczeń' }}</span>
                                        </td>
                                        <td align="right" valign="middle" style="padding:15px 16px;{{ !$loop->last ? 'border-bottom:1px solid #3f2530;' : '' }}font-size:16px;font-weight:700;white-space:nowrap;color:#fda4af;">{{ number_format($debt['amount'], 2, ',', ' ') }} zł</td>
                                    </tr>
                                @endforeach
                            </table>
                        @endif

                        @if(count($summary['owed_by']) > 0)
                            <p style="margin:28px 0 10px;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#5eead4;">Winni Tobie</p>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #174c48;border-radius:12px;background-color:#102524;">
                                @foreach($summary['owed_by'] as $debt)
                                    <tr>
                                        <td style="padding:15px 16px;{{ !$loop->last ? 'border-bottom:1px solid #174c48;' : '' }}">
                                            <span style="display:block;font-size:15px;font-weight:700;color:#f8fafc;">{{ $debt['user']->name }}</span>
                                            <span style="display:block;margin-top:3px;font-size:12px;color:#94a3b8;">{{ $debt['items_count'] }} {{ $debt['items_count'] === 1 ? 'rozliczenie' : 'rozliczeń' }}</span>
                                        </td>
                                        <td align="right" valign="middle" style="padding:15px 16px;{{ !$loop->last ? 'border-bottom:1px solid #174c48;' : '' }}font-size:16px;font-weight:700;white-space:nowrap;color:#5eead4;">{{ number_format($debt['amount'], 2, ',', ' ') }} zł</td>
                                    </tr>
                                @endforeach
                            </table>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td style="padding:26px 32px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#5eead4" style="border-radius:10px;background-color:#5eead4;"><a href="{{ route('my.debts') }}" style="display:inline-block;padding:13px 20px;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;color:#0b1017;">Zobacz moje rozliczenia&nbsp; →</a></td></tr></table>
                    </td>
                </tr>
                <tr><td style="padding:18px 32px;background-color:#0f172a;border-top:1px solid #1e293b;font-size:12px;line-height:18px;color:#64748b;">Wiadomość wygenerowana automatycznie przez Splitter.</td></tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
