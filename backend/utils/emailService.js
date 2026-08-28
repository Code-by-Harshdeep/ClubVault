const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

let _transporter = null;

// Get or initialize Nodemailer transporter using Gmail (direct SSL port 465 with IPv4 for cloud reliability)
const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  if (!emailUser || !emailPass) {
    console.warn("⚠️ Warning: EMAIL_USER or EMAIL_APP_PASSWORD not configured in environment variables.");
    return null;
  }

  if (!_transporter || _transporter.user !== emailUser) {
    _transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4, // Force IPv4 to avoid ENETUNREACH on Render/cloud networks
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: true,
      },
    });
    _transporter.user = emailUser;
  }

  return _transporter;
};

/**
 * Send a verification email with a verification code
 * @param {string} email - Recipient email address
 * @param {string} verificationCode - 6-digit or custom verification code
 * @param {string} [fullName] - Optional recipient full name
 */
const sendVerificationEmail = async (email, verificationCode, fullName = "") => {
  try {
    const greeting = fullName ? `Hello ${fullName},` : "Hello,";
    const currentYear = new Date().getFullYear();

    const mailOptions = {
      from: `"ClubVault" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - ClubVault",
      text: `${greeting}\n\nThank you for registering with ClubVault. Your verification code is: ${verificationCode}\n\nThis code will expire soon.\n\nClubVault - Financial Clarity for Student Organizations`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 28px 32px 20px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: left;">
                      <div style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                        🏛️ ClubVault
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                        Absolute financial clarity for student leaders
                      </div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 32px 24px 32px;">
                      <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
                        Verify Your Email Address
                      </h2>
                      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                        ${greeting}<br>
                        Thank you for creating an account on <strong>ClubVault</strong>. Use the verification code below to confirm your university email address:
                      </p>

                      <!-- Code Box -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                        <tr>
                          <td align="center" style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px 24px;">
                            <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px;">
                              Your Verification Code
                            </div>
                            <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #3b82f6; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">
                              ${verificationCode}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0;">
                        ⏱️ This verification code is temporary and will expire shortly.
                      </p>
                      
                      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px;">
                        <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0;">
                          If you did not initiate this request, you can safely ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        &copy; ${currentYear} ClubVault. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const transporter = getTransporter();
    if (!transporter) {
      console.warn("⚠️ Cannot send verification email: SMTP credentials (EMAIL_USER / EMAIL_APP_PASSWORD) not configured.");
      return { success: false, error: "SMTP credentials not configured in environment variables" };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send a welcome email after successful onboarding
 * @param {string} email - Recipient email address
 * @param {string} fullName - Recipient full name
 */
const sendWelcomeEmail = async (email, fullName = "Member") => {
  try {
    const currentYear = new Date().getFullYear();
    const mailOptions = {
      from: `"ClubVault" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to ClubVault! 🎉",
      text: `Hello ${fullName},\n\nWelcome to ClubVault! Your account is active and ready.\n\nClubVault - Financial Clarity for Student Organizations`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to ClubVault</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif; color: #1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                  <tr>
                    <td style="padding: 28px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: left;">
                      <div style="font-size: 22px; font-weight: 700; color: #ffffff;">🏛️ ClubVault</div>
                      <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Welcome to the future of student organization management</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 32px;">
                      <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0;">Welcome, ${fullName}! 🎉</h2>
                      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                        Your ClubVault account is now active. You can start managing budgets, logging club expenses, and submitting proposals with complete financial clarity.
                      </p>
                      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Account Email:</strong> ${email}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${currentYear} ClubVault. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const transporter = getTransporter();
    if (!transporter) {
      console.warn("⚠️ Cannot send welcome email: SMTP credentials not configured.");
      return { success: false, error: "SMTP credentials not configured" };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send a password reset email with code and link
 * @param {string} email - Recipient email address
 * @param {string} resetCode - 6-digit verification code
 * @param {string} [resetLink] - Direct reset password URL
 * @param {string} [fullName] - Recipient full name
 */
const sendPasswordResetEmail = async (email, resetCode, resetLink = "", fullName = "") => {
  try {
    const greeting = fullName ? `Hello ${fullName},` : "Hello,";
    const currentYear = new Date().getFullYear();

    const mailOptions = {
      from: `"ClubVault" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - ClubVault",
      text: `${greeting}\n\nWe received a request to reset your password for your ClubVault account.\n\nYour 6-digit reset code is: ${resetCode}\n\n${resetLink ? `Or click here to reset your password: ${resetLink}\n\n` : ""}This code is valid for 15 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 28px 32px 20px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: left;">
                      <div style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                        🏛️ ClubVault
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                        Security & Access Management
                      </div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 32px 24px 32px;">
                      <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
                        Password Reset Request
                      </h2>
                      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                        ${greeting}<br>
                        We received a request to reset the password associated with your account (<strong>${email}</strong>). Use the verification code below to set a new password:
                      </p>

                      <!-- Code Box -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                        <tr>
                          <td align="center" style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px 24px;">
                            <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px;">
                              6-Digit Reset Code
                            </div>
                            <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">
                              ${resetCode}
                            </div>
                          </td>
                        </tr>
                      </table>

                      ${resetLink ? `
                      <!-- Direct Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                              Reset Password Directly &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ""}

                      <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0;">
                        ⏱️ <strong>Note:</strong> This reset code will expire in <strong>15 minutes</strong> for security reasons.
                      </p>
                      
                      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px;">
                        <p style="font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0;">
                          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        &copy; ${currentYear} ClubVault. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const transporter = getTransporter();
    if (!transporter) {
      console.warn("⚠️ Cannot send password reset email: SMTP credentials not configured.");
      return { success: false, error: "SMTP credentials not configured" };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getTransporter,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
