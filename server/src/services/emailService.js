import nodemailer from 'nodemailer';

const BUSINESS_BOOKING_EMAIL = process.env.BUSINESS_BOOKING_EMAIL || 'enquiry@nexworldtravel.com';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'no-reply@nexworldtravel.com';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    try {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });
      console.log('[EmailService] Configured SMTP transporter.');
    } catch (e) {
      console.warn('[EmailService] SMTP initialization failed:', e.message);
    }
  } else {
    // Development/Fallback mock transporter
    transporter = {
      sendMail: async (options) => {
        console.log('\n[EmailService - Simulated Dispatch]');
        console.log(`To: ${options.to}`);
        console.log(`From: ${options.from}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content Preview: ${options.text ? options.text.slice(0, 150) : options.html?.slice(0, 150)}...`);
        console.log('[EmailService] Notification delivered to simulated logger.\n');
        return { messageId: 'simulated-' + Date.now() };
      },
    };
  }

  return transporter;
};

export const sendBookingNotification = async (booking) => {
  try {
    const mailer = getTransporter();
    const mailOptions = {
      from: `"Nex World Travel & Tourism" <${SMTP_FROM_EMAIL}>`,
      to: BUSINESS_BOOKING_EMAIL,
      subject: `🚨 New Booking Enquiry [${booking.enquiryNumber}]: ${booking.destinationOrPackage}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E6EAF0; border-radius: 12px;">
          <h2 style="color: #172033; margin-top: 0;">New Journey Enquiry Registered</h2>
          <p style="color: #667085; font-size: 14px;">A new travel consultation request was submitted on the Nex World Travel platform.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Enquiry Reference:</td><td style="color: #315EFB; font-weight: bold;">${booking.enquiryNumber}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Lead Traveler:</td><td>${booking.customerName || `${booking.prefix} ${booking.firstName} ${booking.lastName}`}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Email:</td><td><a href="mailto:${booking.email}">${booking.email}</a></td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Mobile Phone:</td><td>${booking.phone}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Nationality:</td><td>${booking.nationality}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Destination / Package:</td><td style="font-weight: bold;">${booking.destinationOrPackage}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Departure Date:</td><td>${booking.travelDate}</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Travelers:</td><td>${booking.adults} Adults, ${booking.children || 0} Children</td></tr>
            <tr style="border-bottom: 1px solid #f0f3f7;"><td style="padding: 8px 0; font-weight: bold; color: #172033;">Requested Activities:</td><td>${booking.activitiesRequired}</td></tr>
          </table>

          <div style="background-color: #F7F9FC; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #667085;">
            <strong>Next Steps:</strong> Review this enquiry in the <a href="http://localhost:3000/admin/dashboard" style="color: #315EFB;">Master Head Portal</a> or Employee Booking Dashboard to contact the traveler within 24 hours.
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

export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const mailer = getTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Nex World Travel Security" <${SMTP_FROM_EMAIL}>`,
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
      from: `"Nex World Travel Headquarters" <${SMTP_FROM_EMAIL}>`,
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

