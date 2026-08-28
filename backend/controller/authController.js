const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

const signup = async (req, res) => {
  try {
    const { universityEmail, password, fullName } = req.body;
    const normalizedEmail = String(universityEmail || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password || !String(fullName || "").trim()) {
      return res.status(400).json({
        message: "Full name, university email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      universityEmail: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      fullName: String(fullName).trim(),
      universityEmail: normalizedEmail,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpiresAt: expiresAt,
    });

    // Send verification email using Gmail + Nodemailer
    try {
      await sendVerificationEmail(user.universityEmail, verificationCode, user.fullName);
    } catch (emailErr) {
      console.error("Email delivery note (signup):", emailErr.message);
    }

    const response = {
      message: "Account created! Please verify your email with the 6-digit OTP code sent to your inbox.",
      requiresVerification: true,
      email: user.universityEmail,
      user: {
        id: user._id,
        fullName: user.fullName,
        universityEmail: user.universityEmail,
      },
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyEmailOTP = async (req, res) => {
  try {
    const { universityEmail, verificationCode } = req.body;
    const normalizedEmail = String(universityEmail || "")
      .trim()
      .toLowerCase();
    const code = String(verificationCode || "").trim();

    if (!normalizedEmail || !code) {
      return res.status(400).json({
        message: "Email and verification code are required",
      });
    }

    const user = await User.findOne({
      universityEmail: normalizedEmail,
    }).select("+emailVerificationCode +emailVerificationExpiresAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      // User is already verified, generate token and proceed
      const token = jwt.sign(
        {
          id: user._id,
          universityEmail: user.universityEmail,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        },
      );
      return res.status(200).json({
        message: "Email already verified",
        token,
        user: {
          _id: user._id,
          universityEmail: user.universityEmail,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
      });
    }

    if (
      !user.emailVerificationCode ||
      user.emailVerificationCode !== code
    ) {
      return res.status(400).json({
        message: "Invalid verification code. Please check your email.",
      });
    }

    if (
      user.emailVerificationExpiresAt &&
      new Date() > new Date(user.emailVerificationExpiresAt)
    ) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new code.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        universityEmail: user.universityEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );

    return res.status(200).json({
      message: "Email verified successfully! Welcome to ClubVault.",
      token,
      user: {
        _id: user._id,
        universityEmail: user.universityEmail,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resendVerificationOTP = async (req, res) => {
  try {
    const { universityEmail } = req.body;
    const normalizedEmail = String(universityEmail || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "University email is required",
      });
    }

    const user = await User.findOne({ universityEmail: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Your email is already verified. You can log in.",
      });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = newCode;
    user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const emailResult = await sendVerificationEmail(
      user.universityEmail,
      newCode,
      user.fullName,
    );

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "A fresh 6-digit verification OTP has been sent to your email.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Resend verification OTP error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { universityEmail, password } = req.body;
    const normalizedEmail = String(universityEmail || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ universityEmail: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Auto-send a new code if unverified
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailVerificationCode = newCode;
      user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      sendVerificationEmail(user.universityEmail, newCode, user.fullName).catch(() => {});

      return res.status(403).json({
        message: "Your email is not verified yet. We have sent a new 6-digit OTP to your email.",
        requiresVerification: true,
        email: user.universityEmail,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        universityEmail: user.universityEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        universityEmail: user.universityEmail,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("BACKEND CRASH:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "fullName universityEmail",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const { email, fullName } = req.body;
    const recipient = email || process.env.EMAIL_USER;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await sendVerificationEmail(recipient, code, fullName || "Test User");

    if (result.success) {
      return res.status(200).json({
        message: `Test verification email sent successfully to ${recipient}`,
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        message: "Failed to send test email",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Test email endpoint error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { universityEmail } = req.body;
    const normalizedEmail = String(universityEmail || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "University email is required",
      });
    }

    const user = await User.findOne({ universityEmail: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this university email address",
      });
    }

    // Generate a secure 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    // Direct reset link for one-click convenience
    const clientUrl =
      req.headers.origin ||
      process.env.CLIENT_URL ||
      "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password?email=${encodeURIComponent(
      normalizedEmail,
    )}&code=${resetCode}`;

    // Send email using Gmail + Nodemailer
    const emailResult = await sendPasswordResetEmail(
      normalizedEmail,
      resetCode,
      resetLink,
      user.fullName,
    );

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "Password reset code has been sent to your email address.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { universityEmail, resetCode } = req.body;
    const normalizedEmail = String(universityEmail || "")
      .trim()
      .toLowerCase();
    const code = String(resetCode || "").trim();

    if (!normalizedEmail || !code) {
      return res.status(400).json({
        message: "Email and reset code are required",
      });
    }

    const user = await User.findOne({
      universityEmail: normalizedEmail,
    }).select("+resetPasswordCode +resetPasswordExpiresAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      return res.status(400).json({
        message: "Invalid reset code",
      });
    }

    if (new Date() > new Date(user.resetPasswordExpiresAt)) {
      return res.status(400).json({
        message: "Reset code has expired. Please request a new one.",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Reset code verified successfully",
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { universityEmail, resetCode, newPassword } = req.body;
    const normalizedEmail = String(universityEmail || "")
      .trim()
      .toLowerCase();
    const code = String(resetCode || "").trim();

    if (!normalizedEmail || !code || !newPassword) {
      return res.status(400).json({
        message: "Email, reset code, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      universityEmail: normalizedEmail,
    }).select("+resetPasswordCode +resetPasswordExpiresAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      return res.status(400).json({
        message: "Invalid reset code",
      });
    }

    if (new Date() > new Date(user.resetPasswordExpiresAt)) {
      return res.status(400).json({
        message: "Reset code has expired. Please request a new one.",
      });
    }

    // Hash new password and clear reset tokens
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  sendTestEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  verifyEmailOTP,
  resendVerificationOTP,
};
