import nodemailer from 'nodemailer';

const getBookingEmail = () =>
  process.env.BOOKING_ASSISTANCE_EMAIL ||
  process.env.BUSINESS_BOOKING_EMAIL ||
  'reservation@nexworldtravel.com';

const getCustomerCareEmail = () =>
  process.env.CUSTOMER_CARE_EMAIL || 'customercare@nexworldtravel.com';

const getFromAddress = (displayName = 'Nex World Travel') => {
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@nexworldtravel.com';
  return `"${displayName}" <${fromEmail}>`;
};

let transporter = null;

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

  if (host && user && password) {
    if (!transporter || transporter.__simulated) {
      try {
        transporter = nodemailer.createTransport({
          host,
          port,
          secure: isSecure,
          auth: {
            user,
            pass: password,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
          },
        });
        transporter.__simulated = false;
        console.log(`[EmailService] Configured SMTP transporter (${host}:${port}, secure=${isSecure}).`);
      } catch (e) {
        console.warn('[EmailService] SMTP initialization failed:', e.message);
      }
    }
  } else {
    // Development/Fallback mock transporter
    if (!transporter || !transporter.__simulated) {
      transporter = {
        __simulated: true,
        sendMail: async (options) => {
          console.log('\n[EmailService - Simulated Dispatch]');
          console.log(`To: ${options.to}`);
          console.log(`From: ${options.from}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Content Preview: ${options.text ? options.text.slice(0, 150) : options.html?.slice(0, 150)}...`);
          console.log('[EmailService] Note: SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) are not set. Notification delivered to simulated logger.\n');
          return { messageId: 'simulated-' + Date.now() };
        },
      };
    }
  }

  return transporter;
};

export const verifySmtpConnection = async () => {
  const mailer = getTransporter();
  if (mailer.__simulated) {
    return {
      configured: false,
      message: 'SMTP credentials missing (SMTP_HOST, SMTP_USER, SMTP_PASSWORD not set in environment). Currently using simulated logger.',
    };
  }
  try {
    await mailer.verify();
    return {
      configured: true,
      success: true,
      message: 'SMTP connection verified successfully.',
    };
  } catch (error) {
    return {
      configured: true,
      success: false,
      error: error.message,
    };
  }
};

export const sendBookingNotification = async (booking) => {
  try {
    const mailer = getTransporter();
    const leadName = booking.memberName || booking.customerName || `${booking.prefix || ''} ${booking.firstName || ''} ${booking.lastName || ''}`.trim();
    const guestsCount = booking.guestsCount || ((Number(booking.adults) || 1) + (Number(booking.children) || 0));
    const checkIn = booking.checkInDate || booking.travelDate || 'Pending Selection';
    const checkOut = booking.checkOutDate || booking.returnDate || 'Flexible';

    const mailOptions = {
      from: getFromAddress('Nex World Travel Reservations'),
      to: getBookingEmail(),
      subject: `🚨 Booking Request [${booking.enquiryNumber}]: ${leadName} — ${booking.destinationOrPackage}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #E6EAF0; border-radius: 16px; background-color: #FFFFFF;">
          <h2 style="color: #172033; margin-top: 0; font-size: 20px;">Standard Booking Request Received</h2>
          <p style="color: #667085; font-size: 13px;">To ensure a smooth and timely booking process, the customer submitted their request in the standard format:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Reference Number:</td><td style="color: #315EFB; font-weight: bold; font-family: monospace;">${booking.enquiryNumber}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Member Name:</td><td><strong>${leadName}</strong></td></tr>
            ${booking.spouseName ? `<tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Spouse Name:</td><td>${booking.spouseName}</td></tr>` : ''}
            ${booking.kidsAges ? `<tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Kids & Ages:</td><td>${booking.kidsAges}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Check-in Date:</td><td style="color: #047857; font-weight: 600;">${checkIn}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Check-out Date:</td><td style="color: #047857; font-weight: 600;">${checkOut}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Destination / Location:</td><td style="font-weight: bold;">${booking.destinationOrPackage}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Number of Guests (PAX):</td><td><strong>${guestsCount} Guest(s)</strong></td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Contact Email:</td><td><a href="mailto:${booking.email}">${booking.email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 10px 0; font-weight: bold; color: #172033;">Phone Number:</td><td><a href="tel:${booking.phone}">${booking.phone}</a></td></tr>
          </table>

          <div style="background-color: #F7F9FC; padding: 14px 18px; border-radius: 10px; font-size: 13px; color: #475467; border-left: 4px solid #315EFB;">
            <em>"Once your request is received, our Reservations Team will check availability and assist you accordingly."</em>
          </div>
        </div>
      `,
    };

    const result = await mailer.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('[EmailService] Failed to send booking notification:', err.message);
    return { success: false, error: err.message };
  }
};

export const sendContactNotification = async (contact) => {
  try {
    const mailer = getTransporter();
    const mailOptions = {
      from: getFromAddress('Nex World Travel Support'),
      to: getCustomerCareEmail(),
      subject: `📩 General Customer Care Inquiry [${contact.ticketNumber}]: ${contact.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E6EAF0; border-radius: 12px;">
          <h2 style="color: #172033; margin-top: 0;">Customer Care Inquiry Registered</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold;">Ticket:</td><td style="font-family: monospace; font-weight: bold;">${contact.ticketNumber}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold;">From:</td><td>${contact.fullName}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${contact.email}">${contact.email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${contact.phone || 'N/A'}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold;">Subject:</td><td>${contact.subject}</td></tr>
          </table>
          <div style="background-color: #F7F9FC; padding: 12px; border-radius: 8px; font-size: 13px; color: #172033; white-space: pre-line;">
            ${contact.message}
          </div>
        </div>
      `,
    };
    const result = await mailer.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('[EmailService] Failed to send contact notification:', err.message);
    return { success: false, error: err.message };
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const mailer = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: getFromAddress('Nex World Travel Security'),
      to: email,
      subject: 'Password Reset Request — Nex World Travel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #E6EAF0; border-radius: 16px;">
          <h2 style="color: #172033; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #667085; font-size: 14px;">Hello ${name || 'User'},</p>
          <p style="color: #667085; font-size: 14px;">We received a request to reset your password for your Nex World Travel account. Click the secure link below to proceed:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #315EFB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="color: #98A2B3; font-size: 12px;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    const result = await mailer.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('[EmailService] Failed to send password reset email:', err.message);
    return { success: false, error: err.message };
  }
};

export const sendAccountActivationEmail = async (email, name, token, role = 'Employee') => {
  try {
    const mailer = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const activateUrl = `${clientUrl}/activate?token=${token}`;

    const mailOptions = {
      from: getFromAddress('Nex World Travel Headquarters'),
      to: email,
      subject: `Activate Your Nex World Travel ${role} Account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #E6EAF0; border-radius: 16px;">
          <h2 style="color: #172033; margin-top: 0;">Welcome to Nex World Travel</h2>
          <p style="color: #667085; font-size: 14px;">Hello ${name || 'Colleague'},</p>
          <p style="color: #667085; font-size: 14px;">Your authorized staff account has been created by the Master Head administrator. Please set your private password to activate your access:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${activateUrl}" style="background-color: #315EFB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Set Password & Activate Account
            </a>
          </div>
          <p style="color: #98A2B3; font-size: 12px;">This activation link is confidential and valid for 48 hours.</p>
        </div>
      `,
    };

    const result = await mailer.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('[EmailService] Failed to send account activation email:', err.message);
    return { success: false, error: err.message };
  }
};
