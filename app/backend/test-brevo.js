// Quick test script to verify Brevo SMTP configuration
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const BREVO_SMTP_LOGIN = process.env.BREVO_SMTP_LOGIN;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@campushive.app';
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY;

console.log('🔍 Testing Brevo SMTP Configuration...\n');
console.log('BREVO_SMTP_LOGIN:', BREVO_SMTP_LOGIN);
console.log('EMAIL_FROM:', EMAIL_FROM);
console.log('BREVO_SMTP_KEY:', BREVO_SMTP_KEY ? `${BREVO_SMTP_KEY.substring(0, 20)}...` : '❌ NOT SET');
console.log('');

if (!BREVO_SMTP_KEY || !BREVO_SMTP_LOGIN) {
  console.error('❌ BREVO_SMTP_LOGIN or BREVO_SMTP_KEY is not set in .env file');
  process.exit(1);
}

// Create transporter with increased timeouts
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: BREVO_SMTP_LOGIN,
    pass: BREVO_SMTP_KEY,
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false
  }
});

console.log('📧 Attempting to verify SMTP connection...\n');

transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP Connection Failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('\n💡 Possible Solutions:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify the SMTP key is correct and active');
    console.error('   3. Make sure port 587 is not blocked by firewall');
    console.error('   4. Generate a new SMTP key at: https://app.brevo.com/settings/keys/smtp');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('   Server is ready to send emails');
    console.log('\n📤 Sending test email...\n');
    
    // Send a test email
    const mailOptions = {
      from: EMAIL_FROM,
      to: process.env.ADMIN_EMAIL || 'astra.campushive@gmail.com',
      subject: '✅ CampusHive Email Test - Brevo Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FFD54F 0%, #F59E0B 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐝 CampusHive Email Test</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #212529;">Success! 🎉</h2>
            <p style="color: #6c757d; font-size: 16px;">Your Brevo SMTP configuration is working correctly!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #212529;">✅ SMTP Host: smtp-relay.brevo.com</p>
              <p style="margin: 10px 0 0 0; color: #212529;">✅ Login: ${BREVO_SMTP_LOGIN}</p>
              <p style="margin: 10px 0 0 0; color: #212529;">✅ From: ${EMAIL_FROM}</p>
              <p style="margin: 10px 0 0 0; color: #212529;">✅ Authentication: Successful</p>
            </div>
            <p style="color: #6c757d;">CampusHive is now ready to send email notifications! 🚀</p>
          </div>
        </div>
      `,
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Failed to send test email:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   To:', mailOptions.to);
        console.log('\n🎉 Brevo email service is fully configured and working!');
        process.exit(0);
      }
    });
  }
});
