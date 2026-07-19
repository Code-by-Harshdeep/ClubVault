const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { universityEmail, password, fullName, clubOrOrganization } = req.body;

    if (!universityEmail || !password || !fullName) {
      return res.status(400).json({
        message: "Full name, university email and password are required",
      });
    }

    const existingUser = await User.findOne({ universityEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    if (!clubOrOrganization) {
      return res.status(400).json({
        message: "Club or organization is required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      universityEmail,
      password: hashedPassword,
      clubOrOrganization,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        universityEmail: user.universityEmail,
        clubOrOrganization: user.clubOrOrganization,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { universityEmail, password } = req.body;

    if (!universityEmail || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ universityEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password ",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        universityEmail: user.universityEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        universityEmail: user.universityEmail,
        fullName: user.fullName,
        clubOrOrganization: user.clubOrOrganization,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("BACKEND CRASH:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  login,
};