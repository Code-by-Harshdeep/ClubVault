require("dotenv").config();
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

async function main() {
  // Read target email from command line argument or fallback to EMAIL_USER
  const targetEmail = process.argv[2] || process.env.EMAIL_USER || "kennny207@gmail.com";
  const recipientName = process.argv[3] || "Student / Evaluator";

  console.log("==================================================");
  console.log("📧 ClubVault Gmail + Nodemailer Multi-Email Test");
  console.log("==================================================");
  console.log("Sender (EMAIL_USER):", process.env.EMAIL_USER);
  console.log("Target Recipient   :", targetEmail);
  console.log("==================================================\n");

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetLink = `http://localhost:5173/reset-password?email=${encodeURIComponent(
    targetEmail,
  )}&code=${resetCode}`;

  console.log(`1️⃣ Sending Signup Verification OTP (${otpCode}) to: ${targetEmail}...`);
  const verifyResult = await sendVerificationEmail(targetEmail, otpCode, recipientName);

  if (verifyResult.success) {
    console.log("   ✅ Verification OTP Email sent successfully! MessageId:", verifyResult.messageId);
  } else {
    console.error("   ❌ Verification OTP Email failed:", verifyResult.error);
  }

  console.log(`\n2️⃣ Sending Password Reset Code (${resetCode}) to: ${targetEmail}...`);
  const resetResult = await sendPasswordResetEmail(targetEmail, resetCode, resetLink, recipientName);

  if (resetResult.success) {
    console.log("   ✅ Password Reset Email sent successfully! MessageId:", resetResult.messageId);
  } else {
    console.error("   ❌ Password Reset Email failed:", resetResult.error);
  }

  if (verifyResult.success && resetResult.success) {
    console.log("\n🎉 All test emails delivered successfully to " + targetEmail + "!");
    process.exit(0);
  } else {
    console.log("\n⚠️ One or more emails encountered an error.");
    process.exit(1);
  }
}

main();
