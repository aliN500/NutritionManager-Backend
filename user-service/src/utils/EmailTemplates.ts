const confirmationTemplate = (YOUR_VERIFICATION_LINK: string, YOUR_COMPANY_LOGO_URL?: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 5px;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            margin: 20px 0;
            text-align: center;
        }
        .btn {
            background-color: #007BFF;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${YOUR_COMPANY_LOGO_URL}" alt="Company Logo">
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Please click the link below to verify your email address.</p>
            <a href="${YOUR_VERIFICATION_LINK}" class="btn">Verify Email</a>
        </div>
        <div class="footer">
            <p>If you did not create an account, no further action is required.</p>
        </div>
    </div>
</body>
</html>`

export default confirmationTemplate;