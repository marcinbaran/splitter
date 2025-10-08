<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tygodniowe Podsumowanie</title>
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
            background-color: #f6f9fc;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 16px;
            opacity: 0.9;
        }

        .content {
            padding: 40px 30px;
        }

        .debt-card {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }

        .debt-label {
            font-size: 14px;
            color: #e53e3e;
            font-weight: 500;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .debt-amount {
            font-size: 32px;
            font-weight: 700;
            color: #e53e3e;
        }

        .info-box {
            background: #f0f9ff;
            border: 1px solid #bee3f8;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }

        .info-box p {
            color: #2b6cb0;
            font-size: 15px;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .divider {
            height: 1px;
            background: #e9ecef;
            margin: 25px 0;
        }

        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }

            .header {
                padding: 30px 20px;
            }

            .debt-amount {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
<div class="email-container">
    <div class="header">
        <h1>📊 Tygodniowe Podsumowanie</h1>
    </div>

    <div class="content">
        <p>Cześć! 👋</p>
        <p>Oto Twoje tygodniowe podsumowanie. Poniżej znajdziesz aktualny stan Twoich zobowiązań.</p>

        <div class="debt-card">
            <div class="debt-label">Aktualny dług</div>
            <div class="debt-amount">{{ number_format($debt['total_amount'], 2, ',', ' ') }} zł</div>
            <p style="color: #718096; font-size: 14px; margin-top: 8px;">
                Stan na {{ now()->format('d.m.Y') }}
            </p>
        </div>

        <div class="info-box">
            <p>💡 <strong>Pamiętaj:</strong> W każdej chwili możesz zalogować się do aplikacji, aby sprawdzić szczegóły swoich zamówień i dokonać płatności.</p>
        </div>

        <div style="text-align: center;">
            <a href="{{ route('dashboard') }}" class="cta-button">
                🚀 Przejdź do aplikacji
            </a>
        </div>

        <div class="divider"></div>

        <p style="color: #718096; font-size: 14px; text-align: center;">
            Wiadomość wygenerowana automatycznie
        </p>
    </div>
</div>
</body>
</html>
