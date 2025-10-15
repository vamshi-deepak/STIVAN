# 🚀 Quick Start - Forgot Password Feature

## ⚡ 5-Minute Setup

### Step 1: Generate Gmail App Password (2 min)
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in: `stivanhelp@gmail.com`
3. Create app password for "Mail" → "STIVAN Backend"
4. Copy the 16-character password (remove spaces)

### Step 2: Update Configuration (30 sec)
```bash
# Edit: backend/.env
# Replace: SMTP_PASS=your-app-specific-password-here
# With: SMTP_PASS=abcdefghijklmnop
```

### Step 3: Test Email (30 sec)
```powershell
cd backend
npm run test:email
```
**Expected**: ✅ Email Configuration Test Result: SUCCESS!

### Step 4: Start Servers (1 min)
```powershell
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm start
```

### Step 5: Test Feature (1 min)
1. Go to: http://localhost:3000/login
2. Click: "Forgot Password"
3. Enter: registered email
4. Check: email inbox for OTP
5. Verify: enter 6-digit code
6. Reset: set new password
7. Success: login with new password ✅

---

## 📧 Email Details

**From**: stivanhelp@gmail.com  
**Subject**: Your STIVAN Password Reset Code  
**Content**: Beautiful HTML with 6-digit OTP  
**Expiry**: 10 minutes

---

## 🔗 Quick Links

- **Setup Guide**: `SETUP_INSTRUCTIONS.md`
- **Email Config**: `backend/EMAIL_SETUP_GUIDE.md`
- **Feature Docs**: `FORGOT_PASSWORD_README.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## 🐛 Troubleshooting

**Problem**: Authentication failed  
**Fix**: Use Gmail App Password, not regular password

**Problem**: Email not received  
**Fix**: Check spam folder, verify email address

**Problem**: OTP expired  
**Fix**: Click "Resend OTP" (valid 10 minutes)

---

## ✅ Verification Checklist

- [ ] Gmail app password generated
- [ ] .env file updated
- [ ] Test email succeeds
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] OTP email received
- [ ] Password reset works
- [ ] Login with new password succeeds

---

## 📱 API Endpoints

```http
POST /api/auth/request-otp      # Send OTP
POST /api/auth/verify-otp       # Verify code
POST /api/auth/reset-password   # Update password
```

---

## 🎯 User Flow

```
Login → Forgot Password? → Enter Email → Receive OTP
→ Verify Code → Set New Password → Success! → Login ✅
```

---

## 💡 Development Tip

Test without email? Comment out SMTP settings in `.env`:
```env
# SMTP_HOST=smtp.gmail.com
# SMTP_PASS=...
```
OTPs will print in backend console.

---

## 🎉 You're Ready!

Once Gmail password is set, everything works automatically:
- ✅ Secure OTP generation
- ✅ Professional emails
- ✅ Beautiful UI
- ✅ Auto-redirect
- ✅ Production ready

**Need help?** Check the detailed guides in project root.

---

**Status**: Production Ready  
**Setup Time**: ~5 minutes  
**Last Updated**: Oct 13, 2025
