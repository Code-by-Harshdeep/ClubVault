const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
       "http://localhost:5174",
      "https://club-vault-eosin.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

// routes
app.use("/api", authRoutes);

module.exports = app;