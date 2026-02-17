import nodemailerModule from 'nodemailer';
const nodemailer = nodemailerModule.default || nodemailerModule;

const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'smtp';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@rkmods.com';

// Create transporter based on service type
const createTransport = () => {
    if (EMAIL_SERVICE === 'sendgrid') {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        });
    } else {
        // SMTP configuration
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
};

const transporter = createTransport();

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @param {'developer' | 'user'} userType - 'developer' or 'user'
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(
    email,
    token,
    userType = 'developer'
) {
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${userType}/verify-email?token=${token}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to RKMODS!</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #06b6d4;">${verifyUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 RKMODS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email - RKMODS',
        html: htmlContent,
    });
}

/**
 * Send app approval notification
 * @param {string} email - Developer email
 * @param {string} appName - App name
 * @returns {Promise<void>}
 */
export async function sendAppApprovedEmail(email, appName) {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ App Approved!</h1>
        </div>
        <div class="content">
          <p>Great news! Your app has been approved and is now live on RKMODS.</p>
          <div class="success-badge">
            <strong>${appName}</strong>
          </div>
          <p>Your app is now visible to all users and available for download.</p>
          <p>Thank you for contributing to the RKMODS community!</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: `✅ Your app "${appName}" has been approved!`,
        html: htmlContent,
    });
}

/**
 * Send app rejection notification
 * @param {string} email - Developer email
 * @param {string} appName - App name
 * @param {string} reason - Rejection reason
 * @returns {Promise<void>}
 */
export async function sendAppRejectedEmail(
    email,
    appName,
    reason
) {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ App Review Update</h1>
        </div>
        <div class="content">
          <p>We've reviewed your app submission for <strong>${appName}</strong>.</p>
          <p>Unfortunately, we cannot approve it at this time for the following reason:</p>
          <div class="reason-box">
            ${reason}
          </div>
          <p>Please address the issue and resubmit your app. If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: `App Review Update: ${appName}`,
        html: htmlContent,
    });
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>We received a request to reset your password.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #ef4444;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p><strong>If you didn't request this, please ignore this email.</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: 'Password Reset Request - RKMODS',
        html: htmlContent,
    });
}
