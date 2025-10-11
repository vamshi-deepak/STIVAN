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
}

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    // Fallback: log to console for development
    console.log('Mailer not configured - fallback log');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    return { ok: true, fallback: true };
  }

  const info = await transporter.sendMail({ from: FROM_EMAIL, to, subject, text, html });
  return info;
}

module.exports = { sendMail };
