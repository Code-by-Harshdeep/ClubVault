const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api", authRoutes);

module.exports = app;