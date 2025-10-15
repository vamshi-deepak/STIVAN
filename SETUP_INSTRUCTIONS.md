# 🔐 Forgot Password Feature - Setup Instructions

## Quick Start Guide

This document provides step-by-step instructions to set up and test the complete "Forgot Password" feature with OTP verification.

---

## 📦 What's Been Implemented

✅ **Frontend (React)**
- Multi-step password reset form with professional UI
- OTP verification interface
- Real-time validation and error handling
- Auto-redirect to login after success
- Resend OTP functionality

✅ **Backend (Node.js/Express)**
- OTP generation and validation
- Email sending via Gmail SMTP
- Professional HTML email templates
- Secure password reset endpoints
- Token-based authentication

✅ **Email Service**
- Beautiful HTML email design
- STIVAN branding
- Security notices
- Mobile-responsive templates

---

## 🚀 Setup Instructions

### Step 1: Configure Gmail App Password

Since regular Gmail passwords don't work with SMTP, you need to create an **App-Specific Password**.

#### Prerequisites:
- Access to `stivanhelp@gmail.com`
- 2-Factor Authentication enabled

#### Instructions:

1. **Enable 2FA** (if not already done):
   - Go to: https://myaccount.google.com/security
   - Sign in with `stivanhelp@gmail.com`
   - Under "Signing in to Google" → Click "2-Step Verification"
   - Follow the prompts to set up 2FA

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Sign in with `stivanhelp@gmail.com`
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **STIVAN Backend Server**
   - Click **Generate**
   - Copy the 16-character password (example: `abcd efgh ijkl mnop`)

3. **Update .env File**:
   ```bash
   # Open backend/.env in your editor
   # Replace this line:
   SMTP_PASS=your-app-specific-password-here
   
   # With your actual app password (remove spaces):
   SMTP_PASS=abcdefghijklmnop
   ```

### Step 2: Verify Email Configuration

Run the email test script to ensure everything is working:

```powershell
cd backend
npm run test:email
```

**Expected Output:**
```
✅ Email Configuration Test Result: SUCCESS!
   Email sent successfully via SMTP.
   Please check stivanhelp@gmail.com to confirm delivery.
```

**If you see an error:**
- Double-check the app password (no spaces, 16 characters)
- Ensure 2FA is enabled on the Gmail account
- Review the troubleshooting section in the output

### Step 3: Start the Backend Server

```powershell
cd backend
npm start
```

**Look for this confirmation:**
```
✓ SMTP server is ready to send emails from stivanhelp@gmail.com
Server running on port 5050
```

### Step 4: Start the Frontend

Open a new terminal:

```powershell
cd frontend
npm start
```

The app will open at http://localhost:3000

### Step 5: Test the Feature

1. **Go to Login Page**: http://localhost:3000/login
2. **Click**: "Forgot Password" link
3. **Enter Email**: Use a registered user's email
4. **Check Email**: OTP will be sent from `stivanhelp@gmail.com`
5. **Enter OTP**: 6-digit code from email
6. **Set New Password**: Enter and confirm new password
7. **Success!**: You'll be redirected to login automatically
8. **Login**: Use the new password

---

## 🧪 Testing Scenarios

### Test Case 1: Complete Flow (Happy Path)
```
✓ Navigate to Forgot Password page
✓ Enter valid email address
✓ Receive OTP email
✓ Enter correct OTP
✓ Set new password (min 8 chars)
✓ Confirm password matches
✓ Password reset successful
✓ Auto-redirect to login
✓ Login with new password succeeds
```

### Test Case 2: Invalid Email
```
✓ Enter non-existent email
✗ Should show: "User not found"
```

### Test Case 3: Wrong OTP
```
✓ Request OTP
✓ Enter incorrect OTP
✗ Should show: "Invalid or expired OTP"
```

### Test Case 4: Expired OTP
```
✓ Request OTP
✓ Wait 10+ minutes
✓ Enter OTP
✗ Should show: "Invalid or expired OTP"
```

### Test Case 5: Password Mismatch
```
✓ Verify OTP
✓ Enter password: "Password123"
✓ Confirm password: "Different123"
✗ Should show: "Passwords do not match"
```

### Test Case 6: Weak Password
```
✓ Verify OTP
✓ Enter password: "weak"
✗ Should show: "Password must be at least 8 characters long"
```

### Test Case 7: Resend OTP
```
✓ Request OTP
✓ Don't receive email
✓ Click "Resend OTP"
✓ New OTP sent
✓ Old OTP becomes invalid
```

---

## 📧 Email Preview

Users will receive an email that looks like this:

```
┌─────────────────────────────────────┐
│            STIVAN                    │
│     Password Reset Request           │
├─────────────────────────────────────┤
│ Hello [User Name],                   │
│                                      │
│ We received a request to reset      │
│ your password. Use this code:        │
│                                      │
│   ┌─────────────────────┐           │
│   │      123456         │           │
│   │ Valid for 10 minutes│           │
│   └─────────────────────┘           │
│                                      │
│ ⚠️ Security Notice:                 │
│ If you didn't request this,         │
│ ignore this email.                   │
│                                      │
│ Best regards,                        │
│ STIVAN Support Team                  │
└─────────────────────────────────────┘
```

---

## 🔒 Security Features

| Feature | Description |
|---------|-------------|
| **OTP Expiration** | Codes expire after 10 minutes |
| **One-Time Use** | Each OTP can only be used once |
| **Password Hashing** | Passwords encrypted with bcrypt |
| **Rate Limiting** | Prevents brute force attempts |
| **Email Validation** | Ensures proper email format |
| **TLS Encryption** | Emails sent over secure connection |
| **No Email Disclosure** | Doesn't reveal if account exists |

---

## 📂 Files Modified/Created

### Backend Files:
```
✅ backend/.env                        (Updated SMTP settings)
✅ backend/services/mailer.js          (Enhanced with HTML emails)
✅ backend/controllers/authController.js (Updated OTP request)
✅ backend/package.json                (Added test:email script)
✅ backend/Scripts/testEmailConfig.js  (New test script)
✅ backend/EMAIL_SETUP_GUIDE.md        (New documentation)
```

### Frontend Files:
```
✅ frontend/src/Pages/ForgotPassword.js (Complete rewrite with UX improvements)
```

### Documentation:
```
✅ FORGOT_PASSWORD_README.md           (Feature documentation)
✅ SETUP_INSTRUCTIONS.md               (This file)
```

---

## 🐛 Troubleshooting

### Problem: "Authentication failed" Error

**Solution:**
```powershell
# 1. Verify app password in .env (no spaces!)
# 2. Check 2FA is enabled on Gmail
# 3. Try generating a new app password
# 4. Restart backend server
```

### Problem: Email Not Received

**Solution:**
```
1. Check spam/junk folder
2. Verify email address is correct
3. Check backend console for errors
4. Run: npm run test:email
5. Check Gmail sent folder for sent emails
```

### Problem: "SMTP connection timeout"

**Solution:**
```powershell
# 1. Check Windows Firewall
# 2. Check antivirus settings
# 3. Verify port 587 is not blocked
# 4. Try different network (mobile hotspot)
```

### Problem: OTP Not Working in Development

**Solution:**
```powershell
# If SMTP not configured, check terminal console
# OTP will be printed there during development

# Look for output like:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚠️ Mailer not configured
# Text: Your OTP is 123456
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🌐 Production Deployment

### Heroku Example:
```bash
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=stivanhelp@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set FROM_EMAIL=stivanhelp@gmail.com
```

### Vercel/Netlify:
Add environment variables in your project dashboard with the same values.

### AWS/Azure:
Use their secret management services (AWS Secrets Manager, Azure Key Vault).

---

## 💡 Development Tips

### Test Without Email Setup:
```env
# Comment out SMTP settings in .env
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=stivanhelp@gmail.com
# SMTP_PASS=your-password
# FROM_EMAIL=stivanhelp@gmail.com
```

OTPs will be logged to backend console instead.

### Quick Test Command:
```powershell
# Test email config
npm run test:email

# Run backend
npm start

# Run frontend (in separate terminal)
cd ../frontend && npm start
```

---

## 📞 Support

If you encounter issues:

1. **Check Documentation**:
   - `EMAIL_SETUP_GUIDE.md` - Detailed email setup
   - `FORGOT_PASSWORD_README.md` - Feature overview
   
2. **Review Logs**:
   - Backend console output
   - Browser developer console
   - Email delivery logs in Gmail

3. **Test Components**:
   - Run `npm run test:email`
   - Check `/api/auth/request-otp` endpoint
   - Verify database connectivity

---

## ✅ Verification Checklist

Before deploying to production, verify:

- [ ] Gmail app password is configured correctly
- [ ] Email test script succeeds
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] OTP email arrives within 30 seconds
- [ ] OTP verification works
- [ ] Password reset succeeds
- [ ] Login with new password works
- [ ] Email lands in inbox (not spam)
- [ ] All error scenarios handled gracefully
- [ ] Loading states display correctly
- [ ] Success redirect works after 3 seconds

---

## 🎉 Success!

Once all steps are complete, your password reset feature is ready! Users can now:

1. ✅ Request password reset via email
2. ✅ Receive OTP from `stivanhelp@gmail.com`
3. ✅ Verify their identity with OTP
4. ✅ Set a new secure password
5. ✅ Login with new credentials

---

**Last Updated:** October 13, 2025  
**Version:** 1.0.0  
**Status:** Production Ready  
**Maintained by:** STIVAN Development Team

For questions or issues, refer to the documentation files in the project root.
