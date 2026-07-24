import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useTheme } from "../../ThemeContext";
import { Sun, Moon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
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

    const { universityEmail, password } = formData;

    if (!universityEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // Response wasn't JSON (e.g. a 404 HTML page from a wrong route)
      }

      if (!res.ok) {
        if (res.status === 404) {
          setError("Login endpoint not found (404) — check the API route/URL.");
        } else {
          setError(data.message || `Request failed (${res.status}).`);
        }
        setLoading(false);
        return;
      }

   

      // Save token so future requests can use it
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page bounce-page">

      {/* Left Login Panel */}
      <div className="login-panel">

        <button
          className="login-theme-toggle"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="login-container">

          {/* Brand */}
          <div className="brand">
            <h1>ClubVault</h1>
            <p>Finance Committee</p>
          </div>


          {/* Header */}
          <div className="header">
            <h2>Log In</h2>

            <p>
              Enter your credentials to securely access your dashboard.
            </p>
          </div>


          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="universityEmail"
                placeholder="leader@university.edu"
                value={formData.universityEmail}
                onChange={handleChange}
              />

            </div>



            {/* Password */}
            <div className="field">

              <div className="password-label">

                <label>
                  Password
                </label>

                <a href="#">
                  Forgot password?
                </a>

              </div>


              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />

            </div>

            {/* Error message */}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >

              {loading ? "Logging In..." : "Log In"}

              <span>
                →
              </span>

            </button>


          </form>



          {/* Signup */}
          <div className="signup">

            <p>
              Don't have an account?

              <a href="/signup">
                Sign Up
              </a>

            </p>

          </div>



        </div>

      </div>




      {/* Right Image Panel */}
      <div className="image-panel">

        <div className="overlay"></div>

      </div>



    </div>
  );
};


export default Login;