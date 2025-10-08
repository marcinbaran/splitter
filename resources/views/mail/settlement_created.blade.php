<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nowe zamówienie</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .content {
            padding: 40px;
        }

        .order-info {
            background: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .info-item:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: 500;
            color: #64748b;
        }

        .info-value {
            font-weight: 600;
            color: #1e293b;
        }

        .final-amount {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 24px 0;
        }

        .final-amount .label {
            font-size: 14px;
            opacity: 0.9;
        }

        .final-amount .amount {
            font-size: 28px;
            font-weight: 700;
            margin-top: 4px;
        }

        .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .footer {
            text-align: center;
            padding: 24px;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 600px) {
            .content {
                padding: 20px;
            }

            .header {
                padding: 20px;
            }

            .header h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🎉 UTWORZONO NOWE ZAMÓWIENIE</h1>
    </div>

    <div class="content">
        <div class="order-info">
            <div class="info-item">
                <span class="info-label">Nazwa restauracji:</span>
                <span class="info-value">{{ $settlement->restaurant_name }}</span>
            </div>

            <div class="info-item">
                <span class="info-label">Zniżka:</span>
                <span class="info-value">{{ $settlement->discount }}%</span>
            </div>

            <div class="info-item">
                <span class="info-label">Voucher:</span>
                <span class="info-value">{{ $settlement->voucher }} zł</span>
            </div>

            <div class="info-item">
                <span class="info-label">Koszt dostawy:</span>
                <span class="info-value">{{ $settlement->delivery }} zł</span>
            </div>

            <div class="info-item">
                <span class="info-label">Koszt transakcji:</span>
                <span class="info-value">{{ $settlement->transaction }} zł</span>
            </div>
        </div>

        <div class="final-amount">
            <div class="label">KWOTA DO ZAPŁATY</div>
            <div class="amount">{{ $settlementItem->final_amount }} zł</div>
        </div>

        <div style="text-align: center;">
            <p style="color: #64748b; margin-bottom: 16px;">
                Kliknij poniżej, aby zobaczyć więcej szczegółów zamówienia:
            </p>
            <a href="{{ route('settlements.show', ['settlement' => $settlement->id]) }}" class="button">
                ZOBACZ SZCZEGÓŁY ZAMÓWIENIA
            </a>
        </div>
    </div>

    <div class="footer">
        <p>Wiadomość wygenerowana automatycznie</p>
    </div>
</div>
</body>
</html>
