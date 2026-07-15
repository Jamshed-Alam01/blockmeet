const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const requireAuth = require('../middleware/auth');



router.post('/create', requireAuth, async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress required" });
  }

  try {
    
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user || !user.verified) {
      return res.status(403).json({ error: "Wallet not verified" });
    }

    const meetingId = uuidv4();
    const newMeeting = new Meeting({ meetingId, hostAddress: walletAddress.toLowerCase() });
    await newMeeting.save();
    res.json({ meetingId });
  } catch (err) {
    console.error("MEETING CREATE ERROR:", err);
    res.status(500).json({ error: "Meeting creation failed" });
  }
});

// Check a meeting exists — used before letting someone join
// Left open (no requireAuth) since a person joining via a shared link
// may not have created an account yet at the point of checking the link.
router.get('/:meetingId', async (req, res) => {
  const { meetingId } = req.params;

  try {
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }
    res.json({ meetingId: meeting.meetingId, hostAddress: meeting.hostAddress });
  } catch (err) {
    console.error("MEETING LOOKUP ERROR:", err);
    res.status(500).json({ error: "Lookup failed" });
  }
});

module.exports = router;