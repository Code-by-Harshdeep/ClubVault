import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  Sun,
  Moon,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
} from "lucide-react";

import { useTheme } from "../../ThemeContext";
import "./Signup.css";
import SignupImage from "../../assets/signupImg.png";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordChecks = (password) => ({
  length: password.length >= 6,
});

const Signup = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const fullNameRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    universityEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [success, setSuccess] = useState(false);

  // ----------------------------------------
  // AUTO FOCUS & ALREADY LOGGED IN CHECK
  // ----------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
      return;
    }
    fullNameRef.current?.focus();
  }, [navigate]);


  // ----------------------------------------
  // VALIDATE SINGLE FIELD
  // ----------------------------------------
  const validateField = (name, values) => {
    const {
      fullName,
      universityEmail,
      password,
      confirmPassword,
    } = values;

    switch (name) {
      case "fullName":
        return fullName.trim()
          ? ""
          : "Full name is required.";

      case "universityEmail":
        if (!universityEmail.trim()) {
          return "University email is required.";
        }

        if (!EMAIL_REGEX.test(universityEmail.trim())) {
          return "Enter a valid email address.";
        }

        return "";

      case "confirmPassword":
        if (!confirmPassword) {
          return "Please confirm your password.";
        }

        if (confirmPassword !== password) {
          return "Passwords do not match.";
        }

        return "";

      default:
        return "";
    }
  };

  // ----------------------------------------
  // VALIDATE ENTIRE FORM
  // ----------------------------------------
  const validateAll = (values) => {
    const errors = {};

    ["fullName", "universityEmail", "confirmPassword"].forEach(
      (name) => {
        const message = validateField(name, values);

        if (message) {
          errors[name] = message;
        }
      }
    );

    if (!values.password) {
      errors.password = "Password is required.";
    } else if (values.password.length < 6) {
      errors.password =
        "Password must be at least 6 characters.";
    }

    return errors;
  };

  // ----------------------------------------
  // HANDLE INPUT CHANGE
  // ----------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    const nextValues = {
      ...formData,
      [name]: value,
    };

    setFormData(nextValues);

    // Clear server error when user starts typing again
    if (serverError) {
      setServerError("");
    }

    // PASSWORD
    if (name === "password") {
      if (touched.password) {
        setFieldErrors((prev) => ({
          ...prev,
          password:
            nextValues.password.length >= 6
              ? ""
              : "Password must be at least 6 characters.",
        }));
      }

      // Revalidate confirm password if already touched
      if (touched.confirmPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: validateField(
            "confirmPassword",
            nextValues
          ),
        }));
      }

      return;
    }

    // CONFIRM PASSWORD
    if (name === "confirmPassword") {
      if (touched.confirmPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: validateField(
            "confirmPassword",
            nextValues
          ),
        }));
      }

      return;
    }

    // Other fields
    if (touched[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValues),
      }));
    }
  };

  // ----------------------------------------
  // HANDLE BLUR
  // ----------------------------------------
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Password validation
    if (name === "password") {
      setFieldErrors((prev) => ({
        ...prev,
        password:
          formData.password.length >= 6
            ? ""
            : "Password must be at least 6 characters.",
      }));

      return;
    }

    // Other fields
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData),
    }));
  };

  // ----------------------------------------
  // LOGIN NAVIGATION
  // ----------------------------------------
  const handleLoginClick = (e) => {
    /*
      IMPORTANT:

      preventDefault prevents the browser from doing
      normal link navigation.

      navigate() performs React Router navigation.

      Because this handler is attached to onMouseDown
      instead of onClick, navigation happens BEFORE
      the input's onBlur event.

      Therefore:
      Clicking "Log In"
      -> navigate to /login
      -> no "Full name is required" error
    */

    e.preventDefault();

    navigate("/login");
  };

  // ----------------------------------------
  // CHECK IF FORM IS FILLED
  // ----------------------------------------
  const isFormFilled =
    formData.fullName.trim() &&
    formData.universityEmail.trim() &&
    formData.password &&
    formData.confirmPassword;

  // ----------------------------------------
  // SUBMIT
  // ----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    const errors = validateAll(formData);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      setTouched({
        fullName: true,
        universityEmail: true,
        password: true,
        confirmPassword: true,
      });

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          universityEmail:
            formData.universityEmail.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(
          data.message ||
            "Something went wrong. Please try again."
        );

        setLoading(false);
        return;
      }

      // Signup successful - navigate to OTP verification screen
      setSuccess(true);

      setTimeout(() => {
        navigate(
          `/verify-email?email=${encodeURIComponent(
            formData.universityEmail.trim(),
          )}`,
        );
      }, 1000);
    } catch (err) {
      console.error(err);

      setServerError(
        "Could not reach the server. Please try again."
      );

      setLoading(false);
    }
  };

  const checks = passwordChecks(formData.password);

  return (
    <div className="signup-page">
      {/* ======================================
          THEME TOGGLE
      ====================================== */}
      <button
        className="signup-theme-toggle"
        aria-label={
          theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        onClick={toggleTheme}
        type="button"
      >
        {theme === "dark" ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )}
      </button>

      {/* ======================================
          LEFT IMAGE PANEL
      ====================================== */}
      <div className="signup-image-panel">
        <img
          src={SignupImage}
          alt="University architecture"
        />

        <div className="signup-overlay"></div>

        <div className="signup-left-content">
          <div className="signup-brand">
            <Landmark
              color="#ffffff"
              size={32}
            />

           <a href="/" id="home"> <span>ClubVault</span></a>
          </div>

          <div className="signup-message">
            <h2>
              Absolute financial clarity for student
              leaders.
            </h2>

            <p>
              Manage budgets, track expenses, and ensure
              compliance with a tool designed for the
              precision required by modern university
              organizations.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================
          RIGHT FORM PANEL
      ====================================== */}
      <div className="signup-form-panel">
        <div className="signup-container">
          {/* Mobile Brand */}
          <div className="mobile-brand">
            <Landmark
              color="currentColor"
              size={28}
            />

            <span>ClubVault</span>
          </div>

          {/* Header */}
          <div className="signup-header fade-up">
            <h1>Create Account</h1>

            <p>
              Set up your club's operational hub.
            </p>
          </div>

          {/* ======================================
              SUCCESS STATE
          ====================================== */}
          {success ? (
            <div
              className="signup-success fade-up"
              role="status"
            >
              <CheckCircle2 size={20} />

              <span>
                Account created! Redirecting to login…
              </span>
            </div>
          ) : (
            <>
              {/* ======================================
                  SIGNUP FORM
              ====================================== */}
              <form
                className="signup-form"
                onSubmit={handleSubmit}
                noValidate
              >
                {/* FULL NAME */}
                <div className="signup-field fade-up delay-100">
                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    ref={fullNameRef}
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Jane Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="name"
                    aria-invalid={
                      !!fieldErrors.fullName
                    }
                    aria-describedby={
                      fieldErrors.fullName
                        ? "fullName-error"
                        : undefined
                    }
                    className={
                      fieldErrors.fullName
                        ? "input-error"
                        : ""
                    }
                  />

                  {fieldErrors.fullName && (
                    <p
                      className="signup-field-error"
                      id="fullName-error"
                    >
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                {/* UNIVERSITY EMAIL */}
                <div className="signup-field fade-up delay-200">
                  <label htmlFor="universityEmail">
                    University Email
                  </label>

                  <input
                    id="universityEmail"
                    type="email"
                    name="universityEmail"
                    placeholder="jane@university.edu"
                    value={formData.universityEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    aria-invalid={
                      !!fieldErrors.universityEmail
                    }
                    aria-describedby={
                      fieldErrors.universityEmail
                        ? "universityEmail-error"
                        : undefined
                    }
                    className={
                      fieldErrors.universityEmail
                        ? "input-error"
                        : ""
                    }
                  />

                  {fieldErrors.universityEmail && (
                    <p
                      className="signup-field-error"
                      id="universityEmail-error"
                    >
                      {fieldErrors.universityEmail}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="signup-field fade-up delay-300">
                  <label htmlFor="password">
                    Password
                  </label>

                  <div className="password-wrapper">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      aria-invalid={
                        !!fieldErrors.password
                      }
                      aria-describedby="password-checklist"
                      className={
                        fieldErrors.password
                          ? "input-error"
                          : ""
                      }
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <div
                    className="password-checklist"
                    id="password-checklist"
                  >
                    <span
                      className={
                        checks.length
                          ? "check-met"
                          : "check-unmet"
                      }
                    >
                      {checks.length ? (
                        <Check size={12} />
                      ) : null}

                      At least 6 characters
                    </span>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="signup-field fade-up delay-300">
                  <label htmlFor="confirmPassword">
                    Confirm Password
                  </label>

                  <div className="password-wrapper">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      aria-invalid={
                        !!fieldErrors.confirmPassword
                      }
                      aria-describedby={
                        fieldErrors.confirmPassword
                          ? "confirmPassword-error"
                          : undefined
                      }
                      className={
                        fieldErrors.confirmPassword
                          ? "input-error"
                          : ""
                      }
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  {fieldErrors.confirmPassword && (
                    <p
                      className="signup-field-error"
                      id="confirmPassword-error"
                    >
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* SERVER ERROR */}
                {serverError && (
                  <p
                    className="signup-error"
                    role="alert"
                  >
                    {serverError}
                  </p>
                )}

                {/* CREATE ACCOUNT */}
                <div className="signup-action fade-up delay-400">
                  <button
                    type="submit"
                    disabled={loading || !isFormFilled}
                  >
                    {loading
                      ? "Creating Account..."
                      : "Create Account →"}
                  </button>
                </div>
              </form>

              {/* ======================================
                  LOGIN
              ====================================== */}
              <div className="signup-footer fade-up delay-400">
                <span>
                  Already an administrator?
                </span>

                <button
                  type="button"
                  className="login-link"
                  onMouseDown={handleLoginClick}
                >
                  Log In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;