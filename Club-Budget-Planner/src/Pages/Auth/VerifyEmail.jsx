import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Landmark,
  Sun,
  Moon,
  CheckCircle2,
  ArrowLeft,
  Mail,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useClub } from "../../ClubContext";
import "./VerifyEmail.css";
import SignupImage from "../../assets/signupImg.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { refreshClub } = useClub();

  const queryEmail = searchParams.get("email") || "";
  const queryCode = searchParams.get("code") || "";

  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Auto-fill from query params if code is present
  useEffect(() => {
    if (queryEmail) setEmail(queryEmail);
    if (queryCode && queryCode.length === 6) {
      const digits = queryCode.split("");
      setOtp(digits);
    }
  }, [queryEmail, queryCode]);

  // Focus the first empty box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    // Only accept numbers
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const digit = cleanVal[cleanVal.length - 1];
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);

    // Focus last filled box
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const code = otp.join("").trim();
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Email address is missing. Please sign up or provide your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityEmail: email.trim().toLowerCase(),
          verificationCode: code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid verification code.");
        setLoading(false);
        return;
      }

      // Save credentials & log in
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setVerified(true);

      setTimeout(async () => {
        let clubStatus = "none";
        if (refreshClub) {
          try {
            clubStatus = await refreshClub();
          } catch {}
        }
        if (clubStatus === "approved") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/club-setup", { replace: true });
        }
      }, 1200);

    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setSuccessMsg("");
    setResending(true);

    try {
      const res = await fetch(`${API_URL}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityEmail: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend verification code.");
        setResending(false);
        return;
      }

      setSuccessMsg("A fresh 6-digit OTP has been sent to your email!");
      setCooldown(60); // 60s cooldown
    } catch (err) {
      console.error(err);
      setError("Could not resend code. Please check your connection.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-page bounce-page">
      {/* Theme Toggle */}
      <button
        className="verify-theme-toggle"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        type="button"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left Image Panel */}
      <div className="verify-image-panel">
        <img src={SignupImage} alt="University Architecture" />
        <div className="verify-overlay"></div>
        <div className="verify-left-content">
          <div className="verify-brand">
            <Landmark color="#ffffff" size={32} />
            <Link to="/"><span>ClubVault</span></Link>
          </div>
          <div className="verify-message">
            <h2>Secure Access & Identity Verification.</h2>
            <p>
              Two-factor email verification ensures only authorized student leaders
              and university administrators manage organization finances.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="verify-form-panel">
        <div className="verify-container">
          <div className="verify-header">
            <div className="verify-icon-badge">
              <ShieldCheck size={28} color="#3b82f6" />
            </div>
            <h1>Verify Your Email</h1>
            <p>
              We've sent a 6-digit verification code to:
              <br />
              <strong className="verify-email-highlight">{email || "your email address"}</strong>
            </p>
          </div>

          {verified ? (
            <div className="verify-success-box fade-up">
              <CheckCircle2 size={36} color="#16a34a" />
              <h3>Email Verified!</h3>
              <p>Your account is activated. Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form className="verify-form" onSubmit={handleVerify}>
              {/* 6 Digit Input Boxes */}
              <div className="otp-inputs-container" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`otp-box ${digit ? "otp-box-filled" : ""}`}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && <p className="verify-error" role="alert">{error}</p>}
              {successMsg && <p className="verify-info" role="status">{successMsg}</p>}

              <button
                type="submit"
                className="verify-btn"
                disabled={loading || otp.join("").length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Activate Account →"}
              </button>

              <div className="verify-actions">
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                >
                  <RefreshCw size={14} className={resending ? "spin-icon" : ""} />
                  {cooldown > 0
                    ? `Resend Code in ${cooldown}s`
                    : resending
                    ? "Sending..."
                    : "Resend Code"}
                </button>

                <Link to="/signup" className="change-email-link">
                  <ArrowLeft size={14} />
                  Change Email
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
