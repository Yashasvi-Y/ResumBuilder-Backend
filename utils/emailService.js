// Verify Brevo is initialized
if (!process.env.BREVO_API_KEY || !process.env.BREVO_FROM_EMAIL) {
  console.error('❌ BREVO_API_KEY or BREVO_FROM_EMAIL not found in environment variables');
} else {
  console.log('✅ Brevo email service initialized');
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send OTP via email using Brevo REST API
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`📧 Sending OTP to ${email}... (OTP: ${otp})`);

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Resume Builder', email: process.env.BREVO_FROM_EMAIL },
        to: [{ email }],
        subject: 'Email Verification OTP - Resume Builder',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Your OTP for email verification is:</p>
            <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ OTP sent successfully via Brevo');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send OTP:', error.message);
    throw error;
  }
};

/**
 * Send password reset OTP via email
 */
export const sendPasswordResetEmail = async (email, otp) => {
  try {
    console.log(`📧 Sending password reset OTP to ${email}... (OTP: ${otp})`);

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Resume Builder', email: process.env.BREVO_FROM_EMAIL },
        to: [{ email }],
        subject: 'Password Reset OTP - Resume Builder',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password.</p>
            <p>Your OTP for password reset is:</p>
            <h1 style="color: #dc3545; letter-spacing: 5px;">${otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status}`);
    }

    await response.json();
    console.log('✅ Password reset email sent successfully via Brevo');
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

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Resume Builder', email: process.env.BREVO_FROM_EMAIL },
        to: [{ email }],
        subject: '⚠️ Security Alert: Multiple Failed Login Attempts',
        htmlContent: `
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status}`);
    }

    await response.json();
    console.log('✅ Suspicious login alert sent successfully via Brevo');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending suspicious login email:', error.message);
    return { success: false, error: error.message };
  }
};
