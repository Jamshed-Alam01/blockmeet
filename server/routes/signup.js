const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const existingUser = await User.findOne({ identifier });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      identifier,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        identifier: newUser.identifier,
        walletAddress: newUser.walletAddress,
        verified: newUser.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Account created",
      token,
      user: {
        id: newUser._id,
        identifier: newUser.identifier,
        walletAddress: newUser.walletAddress,
        verified: newUser.verified,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await User.findOne({ identifier });
    if (!user) {
      return res.status(404).json({ error: "User not found. Please register." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        identifier: user.identifier,
        walletAddress: user.walletAddress,
        verified: user.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        identifier: user.identifier,
        walletAddress: user.walletAddress,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

module.exports = router;