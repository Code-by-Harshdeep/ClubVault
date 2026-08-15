import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Sun, Moon } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import "./Signup.css";
import SignupImage from "../../assets/signupImg.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Signup = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    universityEmail: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { fullName, universityEmail, password } = formData;

    if (!fullName || !universityEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Theme Toggle */}
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
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left Image Panel */}
      <div className="signup-image-panel">
        <img
          src={SignupImage}
          alt="University architecture"
        />

        <div className="signup-overlay"></div>

        <div className="signup-left-content">
          <div className="signup-brand">
            <Landmark color="#ffffff" size={32} />
            <span>ClubVault</span>
          </div>

          <div className="signup-message">
            <h2>Absolute financial clarity for student leaders.</h2>

            <p>
              Manage budgets, track expenses, and ensure compliance with a tool
              designed for the precision required by modern university
              organizations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="signup-form-panel">
        <div className="signup-container">
          {/* Mobile Brand */}
          <div className="mobile-brand">
            <Landmark color="currentColor" size={28} />
            <span>ClubVault</span>
          </div>

          {/* Header */}
          <div className="signup-header fade-up">
            <h1>Create Account</h1>
            <p>Set up your club's operational hub.</p>
          </div>

          {/* Form */}
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-field fade-up delay-100">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="signup-field fade-up delay-200">
              <label>University Email</label>

              <input
                type="email"
                name="universityEmail"
                placeholder="jane@university.edu"
                value={formData.universityEmail}
                onChange={handleChange}
              />
            </div>

            <div className="signup-field fade-up delay-300">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <p>Must be at least 6 characters.</p>
            </div>

            {error && (
              <p className="signup-error" role="alert">
                {error}
              </p>
            )}

            <div className="signup-action fade-up delay-400">
              <button type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="signup-footer fade-up delay-400">
            <span>Already an administrator?</span>

            <a href="/login">Log In</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;