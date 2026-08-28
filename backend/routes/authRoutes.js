const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getProfile,
  sendTestEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  verifyEmailOTP,
  resendVerificationOTP,
} = require("../controller/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);

router.post("/login", login);

router.get("/profile", authMiddleware, getProfile);

router.post("/send-test-email", sendTestEmail);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-code", verifyResetCode);

router.post("/reset-password", resetPassword);

router.post("/verify-email", verifyEmailOTP);

router.post("/resend-verification", resendVerificationOTP);

module.exports = router;
