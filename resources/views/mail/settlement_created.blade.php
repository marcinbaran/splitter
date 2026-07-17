<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nowe zamówienie</title>
</head>
<body style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #d4d4d8; background-color: #09090b;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #09090b; padding: 20px 0;">
    <tr>
        <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #121214; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
                <tr>
                    <td align="center" style="background-color: #1c1c1f; padding: 35px 30px; border-bottom: 2px solid #ED1C24;">
                        <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                            🚨 UTWORZONO NOWE ZAMÓWIENIE
                        </h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 30px 40px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1c1c1f; border-radius: 12px; padding: 12px 20px; border: 1px solid #27272a;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-weight: bold; color: #a1a1aa;">Nazwa restauracji:</td>
                                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-weight: bold; color: #ffffff;">{{ $settlement->restaurant_name }}</td>
                            </tr>

                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-weight: bold; color: #a1a1aa;">Zniżka:</td>
                                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-family: monospace; font-weight: bold; color: #ef4444;">{{ $settlement->discount }}%</td>
                            </tr>

                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-weight: bold; color: #a1a1aa;">Voucher:</td>
                                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-family: monospace; font-weight: bold; color: #10b981;">{{ $settlement->voucher }} zł</td>
                            </tr>

                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-weight: bold; color: #a1a1aa;">Koszt dostawy:</td>
                                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #27272a; font-size: 14px; font-family: monospace; font-weight: bold; color: #e4e4e7;">{{ $settlement->delivery }} zł</td>
                            </tr>

                            <tr>
                                <td style="padding: 12px 0; font-size: 14px; font-weight: bold; color: #a1a1aa;">Koszt transakcji:</td>
                                <td align="right" style="padding: 12px 0; font-size: 14px; font-family: monospace; font-weight: bold; color: #e4e4e7;">{{ $settlement->transaction }} zł</td>
                            </tr>

                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                            <tr>
                                <td align="center" style="background-color: #ED1C24; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(237, 28, 36, 0.2);">
                                    <div style="font-size: 11px; font-weight: 900; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; opacity: 0.85;">KWOTA DO ZAPŁATY</div>
                                    <div style="font-size: 32px; font-family: monospace; font-weight: bold; color: #ffffff; margin-top: 4px;">{{ $settlementItem->final_amount }} zł</div>
                                </td>
                            </tr>
                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td align="center" style="padding-top: 10px;">
                                    <p style="color: #71717a; font-size: 13px; font-weight: bold; margin: 0 0 16px 0; letter-spacing: 0.5px;">
                                        Kliknij poniżej, aby zobaczyć więcej szczegółów zamówienia:
                                    </p>
                                    <table border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" bgcolor="#1c1c1f" style="border: 1px solid #3f3f46; border-radius: 8px;">
                                                <a href="{{ route('settlements.show', ['settlement' => $settlement->id]) }}" target="_blank" style="padding: 14px 32px; display: inline-block; text-decoration: none; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; transition: background-color 0.2s;">
                                                    ZOBACZ SZCZEGÓŁY ZAMÓWIENIA
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding: 24px; border-top: 1px solid #27272a; background-color: #0c0c0e;">
                        <p style="margin: 0; color: #52525b; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
                            Wiadomość wygenerowana automatycznie
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
