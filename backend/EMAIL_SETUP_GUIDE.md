# Email Setup Guide for STIVAN

This guide explains how to configure Gmail (stivanhelp@gmail.com) to send OTP verification emails for the password reset feature.

## 🔐 Gmail App Password Setup

Since Gmail doesn't allow direct password authentication for security reasons, you need to create an **App-Specific Password**.

### Prerequisites
- Access to the `stivanhelp@gmail.com` Gmail account
- Two-factor authentication (2FA) must be enabled on the account

### Step-by-Step Instructions

#### 1. Enable 2-Factor Authentication (if not already enabled)
1. Go to https://myaccount.google.com/security
2. Sign in with `stivanhelp@gmail.com`
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to set up 2FA using your phone

#### 2. Generate App-Specific Password
1. Go to https://myaccount.google.com/apppasswords
2. Sign in with `stivanhelp@gmail.com`
3. Under "Select app", choose "Mail"
4. Under "Select device", choose "Other (Custom name)"
5. Enter a name like "STIVAN Backend Server"
6. Click "Generate"
7. **Copy the 16-character password** (it looks like: `xxxx xxxx xxxx xxxx`)
8. This password will only be shown once, so save it securely!

#### 3. Update the .env File
1. Open `backend/.env`
2. Replace `your-app-specific-password-here` with the generated app password:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=stivanhelp@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FROM_EMAIL=stivanhelp@gmail.com
```

**Important:** Remove spaces from the app password when entering it in the .env file:
```env
# Example with spaces (as shown by Google)
SMTP_PASS=abcd efgh ijkl mnop

# Should be entered as (no spaces):
SMTP_PASS=abcdefghijklmnop
```

#### 4. Restart the Backend Server
After updating the .env file, restart your backend server:
```bash
cd backend
npm start
```

You should see a confirmation message:
```
✓ SMTP server is ready to send emails from stivanhelp@gmail.com
```

## 🧪 Testing the Email Setup

### Option 1: Test via Frontend
1. Start both frontend and backend servers
2. Go to http://localhost:3000
3. Click "Forgot Password"
4. Enter a registered email address
5. Check if you receive the OTP email

### Option 2: Test via API (using curl or Postman)
```bash
# Request OTP
curl -X POST http://localhost:5050/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📧 Email Features

The password reset emails include:
- ✅ Professional HTML formatting with STIVAN branding
- ✅ Clear OTP display with expiration time
- ✅ Security warnings for unauthorized attempts
- ✅ Mobile-friendly responsive design
- ✅ Plain text fallback for email clients that don't support HTML

## 🔒 Security Best Practices

1. **Never commit .env files to Git** - They contain sensitive credentials
2. **Use environment variables in production** - Set SMTP credentials via hosting platform (Heroku, Vercel, etc.)
3. **Rotate app passwords periodically** - Generate new ones every few months
4. **Monitor email sending** - Watch for unusual activity in Gmail's sent folder
5. **Set up email rate limiting** - Prevent abuse (already implemented in backend)

## 🚨 Troubleshooting

### "Authentication failed" or "Invalid credentials"
- Double-check the app password is correct (no spaces)
- Ensure 2FA is enabled on the Gmail account
- Try generating a new app password

### "SMTP connection timeout"
- Check your firewall/antivirus settings
- Ensure port 587 is not blocked
- Try using port 465 with `secure: true` option

### Emails going to spam
- Configure SPF, DKIM, and DMARC records for your domain
- Avoid spam trigger words in email content
- Send emails consistently (not in sudden bursts)

### No email received
- Check spam/junk folder
- Verify the recipient email address is correct
- Check backend logs for error messages
- Ensure the SMTP connection is established

## 🔄 Development Mode (No Email Setup)

If you don't want to configure email in development, the system will fall back to console logging:

1. Comment out SMTP settings in `.env`:
```env
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=stivanhelp@gmail.com
# SMTP_PASS=your-app-password
# FROM_EMAIL=stivanhelp@gmail.com
```

2. OTPs will be printed in the terminal console instead of sent via email
3. Look for output like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Mailer not configured - Email simulation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Subject: Your STIVAN Password Reset Code
Text: Your one-time password (OTP) is 123456...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📱 Production Deployment

For production deployments on platforms like Heroku, Vercel, or AWS:

1. Set environment variables in your hosting platform's dashboard
2. **Never** hardcode credentials in code
3. Example for Heroku:
```bash
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=stivanhelp@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set FROM_EMAIL=stivanhelp@gmail.com
```

## 💡 Alternative Email Providers

If you prefer not to use Gmail, you can use other providers:

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
FROM_EMAIL=noreply@yourdomain.com
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
FROM_EMAIL=noreply@yourdomain.com
```

## 📞 Support

If you encounter issues:
1. Check the backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test SMTP connection using online tools
4. Review Gmail's security settings and activity log

---

**Last Updated:** October 2025
**Maintained by:** STIVAN Development Team
