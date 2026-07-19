import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark } from "lucide-react";
import "./Signup.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    clubOrOrganization: "",
    universityEmail: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { fullName, clubOrOrganization, universityEmail, password } =
      formData;

    if (!fullName || !clubOrOrganization || !universityEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      <div className="signup-image-panel">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-49f9SEvG6mmJFCGdFBs1h25uHRZBIoB-pehlwC1hIQCrrTjuKqXz2P89z7BsjQmfCU21QARwkTUrMzuHlQm9_N0Uisx-qdMKhPtQZDI8xy-t4QYWGiGwGp_nhO3XnvXxVC0MaLQWY34x5S_A4Y7vk80sQlCHGrmRTH60GTdS70gCcssYXs26KGrPBrHXJXl1S3gIfPNt54I3SCNlld_NIHIUz3yjnTuroz2TYL9ZUF0YWOBXvn8q_lKX1RF83LJyWqzCv3uqDOj1"
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

      <div className="signup-form-panel">
        <div className="signup-container">
          <div className="mobile-brand">
            <Landmark color="#181512" size={28} />
            <span>ClubVault</span>
          </div>

          <div className="signup-header fade-up">
            <h1>Create Account</h1>
            <p>Set up your club's operational hub.</p>
          </div>

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
              <label>Club or Organization</label>
              <input
                type="text"
                name="clubOrOrganization"
                placeholder="e.g. Debate Society"
                value={formData.clubOrOrganization}
                onChange={handleChange}
              />
            </div>

            <div className="signup-field fade-up delay-300">
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
