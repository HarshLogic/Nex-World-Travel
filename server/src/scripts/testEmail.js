import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { verifySmtpConnection, getTransporter } from '../services/emailService.js';

const targetRecipient = process.argv[2];

async function run() {
  console.log('--- Nex World Travel: SMTP Email Verification Diagnostic ---\n');

  console.log('Current SMTP Configuration in environment:');
  console.log(`- SMTP_HOST:             ${process.env.SMTP_HOST || '(NOT SET)'}`);
  console.log(`- SMTP_PORT:             ${process.env.SMTP_PORT || '587 (default)'}`);
  console.log(`- SMTP_USER:             ${process.env.SMTP_USER || '(NOT SET)'}`);
  console.log(`- SMTP_PASSWORD:         ${process.env.SMTP_PASSWORD ? '********' : '(NOT SET)'}`);
  console.log(`- SMTP_FROM_EMAIL:       ${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@nexworldtravel.com'}`);
  console.log(`- BOOKING_EMAIL:         ${process.env.BOOKING_ASSISTANCE_EMAIL || 'reservation@nexworldtravel.com'}`);
  console.log(`- CUSTOMER_CARE_EMAIL:   ${process.env.CUSTOMER_CARE_EMAIL || 'customercare@nexworldtravel.com'}\n`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️  CRITICAL: Missing SMTP credentials.');
    console.warn('The email service is running in SIMULATED FALLBACK mode.');
    console.warn('Emails are only logged to the console, not sent to actual inboxes.\n');
    console.warn('To fix this, add the following to your server/.env (and Railway dashboard for production):');
    console.warn(`
SMTP_HOST=smtp.gmail.com        # e.g. smtp.gmail.com / smtp.titan.email / smtp.office365.com
SMTP_PORT=587                   # 587 for TLS, or 465 for SSL
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@domain.com
`);
    process.exit(1);
  }

  console.log('Testing SMTP connection handshake with server...');
  const verification = await verifySmtpConnection();

  if (!verification.success) {
    console.error('❌ Connection Failed:', verification.error);
    console.error('\nCommon causes:');
    console.error('1. Wrong SMTP_USER or SMTP_PASSWORD (for Gmail, ensure you use an App Password, not your regular password).');
    console.error('2. Wrong port (try 587 with STARTTLS or 465 with SSL).');
    console.error('3. Firewall or provider blocking outbound SMTP connections.');
    process.exit(1);
  }

  console.log('✅ SMTP Connection Handshake Succeeded! Authenticated with mail server.\n');

  if (targetRecipient) {
    console.log(`Sending a test email to ${targetRecipient}...`);
    try {
      const mailer = getTransporter();
      const info = await mailer.sendMail({
        from: `"Nex World Travel Diagnostics" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: targetRecipient,
        subject: '🧪 Test Email from Nex World Travel System',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #315EFB;">Nex World Travel SMTP Diagnostic</h2>
            <p>Congratulations! Your SMTP transactional email configuration is working properly.</p>
            <p>Emails from Booking inquiries and Customer Care contact forms will now be delivered live to this inbox.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
            <small style="color: #888;">Timestamp: ${new Date().toISOString()}</small>
          </div>
        `,
      });
      console.log(`✅ Test email delivered successfully! Message ID: ${info.messageId}`);
    } catch (err) {
      console.error('❌ Failed to send test email:', err.message);
      process.exit(1);
    }
  } else {
    console.log('💡 Tip: You can test actual email delivery by passing a recipient email:');
    console.log('   npm run test:email your_email@example.com\n');
  }

  process.exit(0);
}

run();

