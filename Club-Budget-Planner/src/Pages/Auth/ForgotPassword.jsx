import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Landmark,
  Sun,
  Moon,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
  ArrowLeft,
  Mail,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "../../ThemeContext";
import "./ForgotPassword.css";
import LoginImage from "../../assets/LoginImg.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  // URL query params for direct links
  const queryEmail = searchParams.get("email") || "";
  const queryCode = searchParams.get("code") || "";

  // Step 1: Request Code | Step 2: Enter Code & New Password | Step 3: Success
  const [step, setStep] = useState(queryCode && queryEmail ? 2 : 1);
  const [universityEmail, setUniversityEmail] = useState(queryEmail);
  const [resetCode, setResetCode] = useState(queryCode);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (queryEmail) setUniversityEmail(queryEmail);
    if (queryCode) {
      setResetCode(queryCode);
      setStep(2);
    }
  }, [queryEmail, queryCode]);

  // Step 1: Request Reset Code via Email
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    const email = universityEmail.trim().toLowerCase();
    if (!email) {
      setError("Please enter your university email address.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityEmail: email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset code. Please try again.");
        setLoading(false);
        return;
      }

      setInfoMessage(`We've sent a 6-digit verification code to ${email}.`);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    const email = universityEmail.trim().toLowerCase();
    const code = resetCode.trim();

    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityEmail: email,
          resetCode: code,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page bounce-page">
      <div className="forgot-password-panel">
        <button
          className="forgot-theme-toggle"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="forgot-password-container">
          {/* Brand */}
          <div className="brand">
            <h1>ClubVault</h1>
            <p>Finance Committee &bull; Security</p>
          </div>

          {/* Header */}
          <div className="header">
            <h2>{step === 1 ? "Reset Password" : "Enter Reset Code"}</h2>
            <p>
              {step === 1
                ? "Enter your university email to receive a password reset code."
                : `Set a new password for ${universityEmail}`}
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="forgot-success-box fade-up" role="status">
              <CheckCircle2 size={32} color="#16a34a" />
              <h3>Password Reset Successful!</h3>
              <p>Your password has been updated. Redirecting to login...</p>
            </div>
          ) : (
            <>
              {/* STEP 1 FORM */}
              {step === 1 && (
                <form className="forgot-form" onSubmit={handleRequestCode}>
                  <div className="field">
                    <label htmlFor="universityEmail">University Email</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="field-icon" />
                      <input
                        id="universityEmail"
                        type="email"
                        placeholder="leader@university.edu"
                        value={universityEmail}
                        onChange={(e) => setUniversityEmail(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && <p className="forgot-error" role="alert">{error}</p>}

                  <button className="forgot-btn" type="submit" disabled={loading}>
                    {loading ? "Sending Code..." : "Send Reset Instructions →"}
                  </button>

                  <div className="forgot-footer">
                    <Link to="/login" className="back-link">
                      <ArrowLeft size={16} />
                      Back to Log In
                    </Link>
                  </div>
                </form>
              )}

              {/* STEP 2 FORM */}
              {step === 2 && (
                <form className="forgot-form" onSubmit={handleResetPassword}>
                  {infoMessage && (
                    <div className="forgot-info-box">
                      <ShieldCheck size={18} />
                      <span>{infoMessage}</span>
                    </div>
                  )}

                  {/* 6-Digit Code */}
                  <div className="field">
                    <label htmlFor="resetCode">6-Digit Reset Code</label>
                    <div className="input-with-icon">
                      <KeyRound size={18} className="field-icon" />
                      <input
                        id="resetCode"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="code-input"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="field">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-wrapper">
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="password-checklist">
                      <span className={newPassword.length >= 6 ? "check-met" : "check-unmet"}>
                        {newPassword.length >= 6 && <Check size={12} />}
                        At least 6 characters
                      </span>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="field">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="password-wrapper">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="forgot-error" role="alert">{error}</p>}

                  <button className="forgot-btn" type="submit" disabled={loading}>
                    {loading ? "Updating Password..." : "Reset Password →"}
                  </button>

                  <div className="forgot-step-actions">
                    <button
                      type="button"
                      className="text-action-btn"
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      className="text-action-btn"
                      onClick={handleRequestCode}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Image Panel */}
      <div
        className="forgot-image-panel"
        style={{ "--forgot-image": `url(${LoginImage})` }}
      >
        <div className="overlay"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
