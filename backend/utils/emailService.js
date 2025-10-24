// Email service utility for sending OTP emails using Nodemailer
// Configure the following environment variables in your deployment:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS, SMTP_FROM

const nodemailer = require("nodemailer");

// let cachedTransporter = null;

function getTransporter() {
  //   if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL;
  const pass = process.env.PASSCODE;

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cachedTransporter;
}

const emailService = {
  // Send OTP email
  sendOTPEmail: async (email, otp) => {
    try {
      const transporter = getTransporter();

      const from = process.env.EMAIL;
      const subject = "Password Reset OTP - Vidhyara";
      const html = emailService.generateOTPEmailHTML(otp);

      if (!transporter) {
        // Fallback: log to console if SMTP is not configured
        console.log(`\n📧 EMAIL SERVICE (fallback) - OTP Email`);
        console.log(`To: ${email}`);
        console.log(`From: ${from}`);
        console.log(`Subject: ${subject}`);
        console.log(`OTP: ${otp}`);
        console.log(`Expires: 30 minutes\n`);
        return { success: true, message: "OTP logged to console (no SMTP)" };
      }

      await transporter.sendMail({ from, to: email, subject, html });
      return {
        success: true,
        message: "OTP email sent successfully",
      };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        message: "Failed to send OTP email",
      };
    }
  },

  // Generate HTML email template for OTP
  generateOTPEmailHTML: (otp) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .otp-box { background: white; padding: 20px; text-align: center; border: 2px solid #7c3aed; border-radius: 8px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vidhyara</h1>
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have requested to reset your password. Use the following OTP to complete the process:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP is valid for 30 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 Vidhyara. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
};

module.exports = emailService;
