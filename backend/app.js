const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const clubRoutes = require("./routes/clubRoutes");
const campusRoutes = require("./routes/campusRoutes");

const app = express();

// middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins (Vercel deployments, custom domains, localhost)
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// routes
app.use("/api", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/campuses", campusRoutes);

// Global error handler (ensures CORS headers remain intact on unhandled errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
