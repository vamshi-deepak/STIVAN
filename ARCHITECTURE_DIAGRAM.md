# 🔄 Forgot Password - System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FORGOT PASSWORD FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │         │    Gmail     │
│   (React)    │         │  (Node.js)   │         │    SMTP      │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │                        │                        │
┌──────▼────────────────────────────────────────────────────────────┐
│ STEP 1: Request OTP                                                │
└────────────────────────────────────────────────────────────────────┘
       │                        │                        │
       │  POST /request-otp     │                        │
       │  { email: "..." }      │                        │
       ├───────────────────────►│                        │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │ Validate │                  │
       │                   │  Email   │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │ Find User│                  │
       │                   │ in MongoDB│                 │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │ Generate │                  │
       │                   │ 6-digit  │                  │
       │                   │   OTP    │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Store OTP │                  │
       │                   │& Expiry  │                  │
       │                   │in Database│                 │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                        │  Send Email via SMTP   │
       │                        ├───────────────────────►│
       │                        │  { to, subject, html } │
       │                        │                        │
       │                        │                   ┌────▼─────┐
       │                        │                   │ Deliver  │
       │                        │                   │  Email   │
       │                        │                   │ to User  │
       │                        │                   └────┬─────┘
       │  { success: true }     │                        │
       │  "OTP sent to email"   │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
       │                        │                        │
┌──────▼────────────────────────────────────────────────────────────┐
│ USER: Checks email inbox and retrieves OTP code                   │
└────────────────────────────────────────────────────────────────────┘
       │                        │                        │
       │                        │                        │
┌──────▼────────────────────────────────────────────────────────────┐
│ STEP 2: Verify OTP                                                 │
└────────────────────────────────────────────────────────────────────┘
       │                        │                        │
       │  POST /verify-otp      │                        │
       │  { email, otp }        │                        │
       ├───────────────────────►│                        │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Find User │                  │
       │                   │by Email  │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Compare   │                  │
       │                   │OTP Code  │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Check     │                  │
       │                   │Expiry    │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │  { success: true }     │                        │
       │  "OTP verified"        │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
       │                        │                        │
┌──────▼────────────────────────────────────────────────────────────┐
│ STEP 3: Reset Password                                             │
└────────────────────────────────────────────────────────────────────┘
       │                        │                        │
       │  POST /reset-password  │                        │
       │  { email, otp,         │                        │
       │    newPassword }       │                        │
       ├───────────────────────►│                        │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Find User │                  │
       │                   │& Verify  │                  │
       │                   │   OTP    │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Hash New  │                  │
       │                   │Password  │                  │
       │                   │(bcrypt)  │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Update    │                  │
       │                   │Password  │                  │
       │                   │in DB     │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Clear OTP │                  │
       │                   │from DB   │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │  { success: true }     │                        │
       │  "Password reset"      │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
┌──────▼────────────────────────────────────────────────────────────┐
│ STEP 4: Auto-Redirect & Login                                      │
└────────────────────────────────────────────────────────────────────┘
       │                        │                        │
       │  Show Success          │                        │
       │  Countdown: 3...2...1  │                        │
       │  Navigate to /login    │                        │
       │                        │                        │
       │  POST /login           │                        │
       │  { email, newPassword }│                        │
       ├───────────────────────►│                        │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Verify    │                  │
       │                   │Password  │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │                   ┌────▼─────┐                  │
       │                   │Generate  │                  │
       │                   │JWT Token │                  │
       │                   └────┬─────┘                  │
       │                        │                        │
       │  { token, user }       │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
┌──────▼────────────────────────────────────────────────────────────┐
│ SUCCESS: User logged in with new password ✅                       │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Frontend Components

```
ForgotPassword.js
├── Step 1: Request OTP Form
│   ├── Email input field
│   ├── Send OTP button
│   └── Back to login link
│
├── Step 2: Verify OTP Form
│   ├── OTP input (6 digits)
│   ├── Verify button
│   └── Resend OTP link
│
├── Step 3: Reset Password Form
│   ├── New password input
│   ├── Confirm password input
│   ├── Password strength indicator
│   └── Reset button
│
└── Step 4: Success Message
    ├── Success icon & message
    ├── Countdown timer (3s)
    └── Manual login button
```

### Backend Components

```
Auth System
├── Routes (authRoutes.js)
│   ├── POST /api/auth/request-otp
│   ├── POST /api/auth/verify-otp
│   └── POST /api/auth/reset-password
│
├── Controller (authController.js)
│   ├── requestOtp() - Generate & send OTP
│   ├── verifyOtp() - Validate OTP
│   └── resetPassword() - Update password
│
├── Service (mailer.js)
│   ├── SMTP configuration
│   ├── sendMail() - Email delivery
│   └── HTML template formatting
│
└── Model (User.js)
    ├── generateOtp() - Create OTP
    ├── verifyOtp() - Check OTP validity
    └── password hashing (bcrypt)
```

---

## Data Flow

### Database Schema (User Model)

```javascript
User {
  _id: ObjectId
  name: String
  email: String (unique, indexed)
  password: String (hashed)
  
  // OTP Fields
  otp: String              // 6-digit code
  otpExpires: Date         // Expiration timestamp
  
  // Security Fields
  loginAttempts: Number
  lockUntil: Date
  isActive: Boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}
```

### OTP Lifecycle

```
┌─────────────────────────────────────────┐
│  OTP Creation (generateOtp)             │
├─────────────────────────────────────────┤
│ 1. Generate random 6-digit number       │
│ 2. Set expiry: now + 10 minutes         │
│ 3. Store in user.otp field              │
│ 4. Store expiry in user.otpExpires      │
│ 5. Return OTP to send via email         │
└─────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  OTP Verification (verifyOtp)           │
├─────────────────────────────────────────┤
│ 1. Check if OTP exists                  │
│ 2. Check if OTP not expired             │
│ 3. Compare provided OTP with stored     │
│ 4. If valid: clear OTP from DB          │
│ 5. Return true/false                    │
└─────────────────────────────────────────┘
```

---

## Security Measures

```
┌─────────────────────────────────────────────────────┐
│  Security Layer 1: Input Validation                 │
├─────────────────────────────────────────────────────┤
│ ✅ Email format validation                          │
│ ✅ OTP must be exactly 6 digits                     │
│ ✅ Password minimum 8 characters                    │
│ ✅ SQL injection prevention                         │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Security Layer 2: OTP Protection                   │
├─────────────────────────────────────────────────────┤
│ ✅ OTP expires after 10 minutes                     │
│ ✅ OTP cleared after successful use                 │
│ ✅ One OTP per user at a time                       │
│ ✅ Cannot reuse expired OTP                         │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Security Layer 3: Password Security                │
├─────────────────────────────────────────────────────┤
│ ✅ Passwords hashed with bcrypt (10 rounds)         │
│ ✅ Never stored in plain text                       │
│ ✅ Password strength validation                     │
│ ✅ Confirmation required before update              │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Security Layer 4: Communication Security           │
├─────────────────────────────────────────────────────┤
│ ✅ HTTPS for API calls                              │
│ ✅ TLS for email (port 587)                         │
│ ✅ JWT tokens for authentication                    │
│ ✅ CORS protection                                  │
└─────────────────────────────────────────────────────┘
```

---

## Error Handling

```
Frontend Error States:
├── Network errors → "Connection failed, try again"
├── Invalid email → "Please enter a valid email"
├── User not found → "No account with this email"
├── Wrong OTP → "Invalid code, please try again"
├── Expired OTP → "Code expired, request new one"
├── Password mismatch → "Passwords don't match"
└── Weak password → "Password must be 8+ characters"

Backend Error Responses:
├── 400 Bad Request → Invalid input data
├── 401 Unauthorized → Invalid credentials
├── 404 Not Found → User doesn't exist
├── 429 Too Many Requests → Rate limit exceeded
└── 500 Server Error → Unexpected error
```

---

## Email Template Structure

```html
┌──────────────────────────────────────┐
│  STIVAN Logo & Header               │
│  (Purple gradient background)        │
└──────────────────────────────────────┘
│                                      │
│  Hello [User Name],                  │
│                                      │
│  We received a password reset        │
│  request for your account.           │
│                                      │
│  ┌────────────────────────┐          │
│  │  Your verification code │          │
│  │                         │          │
│  │      123456            │          │
│  │                         │          │
│  │  Valid for 10 minutes   │          │
│  └────────────────────────┘          │
│                                      │
│  ⚠️ Security Notice:                │
│  If you didn't request this...      │
│                                      │
│  Best regards,                       │
│  STIVAN Support Team                 │
│                                      │
└──────────────────────────────────────┘
│  Footer: Automated message          │
└──────────────────────────────────────┘
```

---

## Testing Scenarios

```
┌─────────────────────────────────────┐
│  Test Case Matrix                   │
├─────────────────────────────────────┤
│                                     │
│  ✅ Happy Path                      │
│  ├─ Valid email → OTP sent          │
│  ├─ Correct OTP → Verified          │
│  ├─ New password → Updated          │
│  └─ Login → Success                 │
│                                     │
│  ⚠️  Error Cases                    │
│  ├─ Invalid email → 404             │
│  ├─ Wrong OTP → 400                 │
│  ├─ Expired OTP → 400               │
│  ├─ Weak password → Rejected        │
│  └─ Mismatch password → Error       │
│                                     │
│  🔄 Edge Cases                      │
│  ├─ Resend OTP → New code           │
│  ├─ Multiple attempts → Limit       │
│  ├─ Back navigation → State reset   │
│  └─ Auto-redirect → Timer works     │
│                                     │
└─────────────────────────────────────┘
```

---

## Performance Metrics

```
Expected Performance:
├── OTP Generation: < 100ms
├── Email Sending: 1-3 seconds
├── OTP Verification: < 50ms
├── Password Update: < 200ms
├── Frontend Load: < 1 second
└── Total Flow Time: < 2 minutes
```

---

## Monitoring & Logs

```
Backend Logs:
├── [INFO] OTP requested for: user@example.com
├── [INFO] ✓ Email sent successfully
├── [INFO] OTP verified for: user@example.com
├── [INFO] Password reset successful
├── [ERROR] Failed to send email: [reason]
└── [WARN] Invalid OTP attempt: user@example.com

Email Service Logs:
├── ✓ SMTP connection established
├── ✓ Email queued for delivery
├── ✓ Email delivered successfully
└── ✗ Delivery failed: [reason]
```

---

## Deployment Architecture

```
Production Environment:

┌──────────────────┐      ┌──────────────────┐
│   Load Balancer  │─────►│  Frontend        │
│   (CDN/Nginx)    │      │  (React Build)   │
└──────────────────┘      └──────────────────┘
                                    │
                                    │ API Calls
                                    ▼
                          ┌──────────────────┐
                          │  Backend         │
                          │  (Node.js)       │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼───────┐  ┌──▼───────┐  ┌──▼───────┐
            │   MongoDB     │  │  Gmail   │  │   Redis  │
            │   Database    │  │  SMTP    │  │  Cache   │
            └───────────────┘  └──────────┘  └──────────┘
```

---

**Version**: 1.0  
**Last Updated**: October 13, 2025  
**Status**: Production Ready
