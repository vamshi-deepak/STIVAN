const nodemailer = require('nodemailer');

// SendGrid configuration (preferred method - works on Render free tier)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@stivan.com';

// SMTP configuration (fallback for local development)
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = null;
let usingSendGrid = false;

// Prefer SendGrid if API key is available
if (SENDGRID_API_KEY) {
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
      user: 'apikey',
      pass: SENDGRID_API_KEY,
    },
  });
  usingSendGrid = true;
  console.log('✅ SendGrid email service initialized');
} else if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  // Fallback to custom SMTP
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  
  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('✓ SMTP server is ready to send emails from', FROM_EMAIL);
    }
  });
}

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    // Fallback: log to console for development
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Mailer not configured - Email simulation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('To:', to);
    console.log('From:', FROM_EMAIL);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { ok: true, fallback: true };
  }

  try {
    const info = await transporter.sendMail({ 
      from: `"STIVAN Support" <${FROM_EMAIL}>`, 
      to, 
      subject, 
      text, 
      html 
    });
    
    const method = usingSendGrid ? 'SendGrid' : 'SMTP';
    console.log(`✅ Email sent via ${method} to:`, to);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
}

module.exports = { sendMail };
