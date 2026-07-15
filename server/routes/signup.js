const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendOtpEmail = require("../utils/sendEmail");
const router = express.Router();

// Generates a random 6-digit code
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// STEP 1: Request registration — we don't create the account yet.
// We stash the email+hashed-password+otp in the Otp collection and email the code.
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
    const otp = generateOtpCode();

    // Remove any previous pending OTP for this email, then store the new one.
    // We piggyback the hashed password inside the otp field as JSON so we
    // don't need a second collection just for "pending registrations".
    await Otp.deleteMany({ identifier });
    await Otp.create({
      identifier,
      otp: JSON.stringify({ code: otp, hashedPassword }),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendOtpEmail(identifier, otp);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// STEP 2: Verify the OTP — only now do we actually create the User document.
router.post("/verify-otp", async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ error: "Email and OTP required" });
  }

  try {
    const record = await Otp.findOne({ identifier });
    if (!record) {
      return res.status(400).json({ error: "No pending verification. Please register again." });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ identifier });
      return res.status(400).json({ error: "OTP expired. Please register again." });
    }

    const { code, hashedPassword } = JSON.parse(record.otp);

    if (code !== otp) {
      return res.status(401).json({ error: "Incorrect OTP" });
    }

    // OTP correct — now actually create the account
    const newUser = await User.create({
      identifier,
      password: hashedPassword,
    });

    await Otp.deleteMany({ identifier });

    res.json({ success: true, message: "Account verified and created", userId: newUser._id });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ error: "OTP verification failed", details: err.message });
  }
});

// Login — email + password (unchanged)
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