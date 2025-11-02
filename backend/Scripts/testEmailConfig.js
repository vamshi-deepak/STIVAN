/**
 * Email Configuration Test Script
 * 
 * This script tests the SMTP email configuration to ensure emails can be sent successfully.
 * Run this script to verify your email setup before testing the forgot password feature.
 * 
 * Usage: node Scripts/testEmailConfig.js
 */

require('dotenv').config();
const { sendMail } = require('../services/mailer');

async function testEmailConfiguration() {
  console.log('\n┌────────────────────────────────────────────┐');
  console.log('│  STIVAN Email Configuration Test          │');
  console.log('└────────────────────────────────────────────┘\n');

  // Check environment variables
  console.log('📋 Checking Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`SMTP_HOST:     ${process.env.SMTP_HOST || '❌ Not configured'}`);
  console.log(`SMTP_PORT:     ${process.env.SMTP_PORT || '❌ Not configured'}`);
  console.log(`SMTP_USER:     ${process.env.SMTP_USER || '❌ Not configured'}`);
  console.log(`SMTP_PASS:     ${process.env.SMTP_PASS ? '✅ Set (hidden)' : '❌ Not configured'}`);
  console.log(`FROM_EMAIL:    ${process.env.FROM_EMAIL || '❌ Not configured'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  WARNING: SMTP not fully configured!');
    console.log('   Emails will be logged to console instead.\n');
    console.log('   To enable email sending, configure SMTP settings in .env file.');
    console.log('   See EMAIL_SETUP_GUIDE.md for detailed instructions.\n');
  }

  // Test email
  const testEmail = process.env.SMTP_USER || 'test@example.com';
  
  console.log('📧 Sending Test Email:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`To:       ${testEmail}`);
  console.log(`Subject:  STIVAN Email Test`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const subject = 'STIVAN Email Configuration Test';
  const text = 'This is a test email from STIVAN backend server. If you received this, your email configuration is working correctly!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; color: #155724; }
        .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 12px; margin: 20px 0; border-radius: 4px; color: #0c5460; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✅ STIVAN</h1>
          <p style="margin: 10px 0 0 0;">Email Configuration Test</p>
        </div>
        <div class="content">
          <div class="success-box">
            <strong>✅ Success!</strong> Your email configuration is working correctly.
          </div>
          
          <p>Hello,</p>
          
          <p>This is a test email from your STIVAN backend server. If you're reading this, it means your SMTP configuration is set up correctly and emails can be sent successfully.</p>
          
          <div class="info">
            <strong>ℹ️ Configuration Details:</strong><br>
            Server: ${process.env.SMTP_HOST}<br>
            Port: ${process.env.SMTP_PORT}<br>
            From: ${process.env.FROM_EMAIL}<br>
            Timestamp: ${new Date().toISOString()}
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Your password reset feature will now send emails to users</li>
            <li>OTP verification codes will be delivered via email</li>
            <li>Users can securely reset their passwords</li>
          </ul>
          
          <p>If you have any issues, please refer to the <code>EMAIL_SETUP_GUIDE.md</code> file in the backend directory.</p>
          
          <p>Best regards,<br><strong>STIVAN Backend System</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log('⏳ Sending email...\n');
    const result = await sendMail({ to: testEmail, subject, text, html });
    
    if (result.fallback) {
      console.log('⚠️  Email Configuration Test Result: FALLBACK MODE');
      console.log('   Emails are being logged to console instead of sent.');
      console.log('   This is normal for development without SMTP configured.\n');
      console.log('💡 To enable real email sending:');
      console.log('   1. Follow the steps in EMAIL_SETUP_GUIDE.md');
      console.log('   2. Configure SMTP settings in .env file');
      console.log('   3. Run this test script again\n');
    } else {
      console.log('✅ Email Configuration Test Result: SUCCESS!\n');
      console.log('   Email sent successfully via SMTP.');
      console.log(`   Please check ${testEmail} to confirm delivery.\n`);
      console.log('📋 Email Details:');
      console.log(`   Message ID: ${result.messageId || 'N/A'}`);
      console.log(`   Response: ${result.response || 'N/A'}\n`);
      console.log('🎉 Your email system is ready for production use!\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Email Configuration Test Result: FAILED!\n');
    console.error('Error Details:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔧 Troubleshooting Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Verify SMTP credentials in .env file');
    console.log('2. Check if 2FA is enabled on Gmail account');
    console.log('3. Ensure you are using an App-Specific Password (not regular password)');
    console.log('4. Confirm SMTP_HOST is: smtp.gmail.com');
    console.log('5. Confirm SMTP_PORT is: 587');
    console.log('6. Check firewall/antivirus is not blocking port 587');
    console.log('7. Review EMAIL_SETUP_GUIDE.md for detailed instructions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(1);
  }
}

// Run the test
testEmailConfiguration();
