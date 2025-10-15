const nodemailer = require('nodemailer');

// Read SMTP config from env
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@stivan.com';

let transporter = null;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
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
    console.log('✓ Email sent successfully to:', to);
    return info;
  } catch (error) {
    console.error('✗ Failed to send email:', error);
    throw error;
  }
}

module.exports = { sendMail };
