import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Send OTP via email
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`📧 Sending OTP to ${email}...`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP - Resume Builder',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your OTP for email verification is:</p>
          <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset OTP via email
 */
export const sendPasswordResetEmail = async (email, otp) => {
  try {
    console.log(`📧 Sending password reset OTP to ${email}...`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Resume Builder',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p>Your OTP for password reset is:</p>
          <h1 style="color: #dc3545; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send suspicious login attempt notification
 */
export const sendSuspiciousLoginEmail = async (email, userName) => {
  try {
    console.log(`📧 Sending suspicious login alert to ${email}...`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '⚠️ Security Alert: Multiple Failed Login Attempts',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #d32f2f;">🔒 Security Alert</h2>
          <p>Hi ${userName},</p>
          
          <p>We detected <strong>5 failed login attempts</strong> on your Build-a-Résumé account within the last 30 minutes.</p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p><strong>⏳ Your account has been temporarily locked for 15 minutes as a security measure.</strong></p>
          </div>
          
          <h3 style="color: #1976d2;">What you should do:</h3>
          <ul style="line-height: 1.8;">
            <li><strong>If this was you:</strong> Wait 15 minutes and try logging in again. Make sure you're using the correct password.</li>
            <li><strong>If this wasn't you:</strong> Someone may have your password. <strong style="color: #d32f2f;">We recommend changing your password immediately.</strong></li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px;">
            If you didn't initiate this action, please contact our support team immediately.
            <br><br>
            <strong>Build-a-Résumé Security Team</strong>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Suspicious login alert sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending suspicious login email:', error.message);
    return { success: false, error: error.message };
  }
};
