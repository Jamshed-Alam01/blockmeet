const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();
const User = require("../models/User");
const { generateNonce, getNonce, clearNonce } = require("../utils/nonce");

// STEP 1: Frontend calls this to get a nonce for a given wallet
router.post("/nonce", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress required" });
  }

  const nonce = generateNonce(walletAddress);
  res.json({ nonce });
});

// STEP 2: Frontend sends back the signed nonce, we verify it
router.post("/verify", async (req, res) => {
  const { walletAddress, signature, identifier } = req.body;

  if (!walletAddress || !signature || !identifier) {
    return res.status(400).json({ error: "walletAddress, signature and identifier required" });
  }

  const nonce = getNonce(walletAddress);
  if (!nonce) {
    return res.status(400).json({ error: "Nonce expired or not found. Request a new one." });
  }

  try {
    const recoveredAddress = ethers.verifyMessage(nonce, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    clearNonce(walletAddress);

    // Pehle check: kya ye wallet kisi doosre account se already linked hai?
    const walletOwner = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (walletOwner && walletOwner.identifier !== identifier) {
      return res.status(409).json({ error: "This wallet is already linked to another account" });
    }

    // Existing signup wale user ko dhoondo (email/password se bana tha)
    const user = await User.findOne({ identifier });
    if (!user) {
      return res.status(404).json({ error: "Account not found. Please sign up first." });
    }

    // Usi user mein walletAddress add/update karo — naya user mat banao
    user.walletAddress = walletAddress.toLowerCase();
    user.verified = true;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ error: "Verification failed", details: err.message });
  }
});

module.exports = router;