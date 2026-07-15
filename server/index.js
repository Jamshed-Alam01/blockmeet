const express = require("express");
const app = express();

const http = require("http");

const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();

const { ethers } = require("ethers");
const contractABI = require("./NexusFlowRecordsABI.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

const authRoutes = require('./routes/auth');
const signupRoutes = require('./routes/signup');
const meetingRoutes = require('./routes/meeting');




app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.43.102:5173"],

    methods: ["GET", "POST"],
    credentials: true
}));



app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to NexusFlowDB"))
  .catch(err => console.error("Database Connection Error: ", err));

app.use('/auth', authRoutes);
app.use('/signup', signupRoutes);
app.use('/meeting', meetingRoutes);

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: err.message });
});

const server = http.createServer(app);



const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", (meetingId) => {
    socket.join(meetingId);
    console.log(`Socket ${socket.id} joined room: ${meetingId}`);
    socket.to(meetingId).emit("user-connected", socket.id); // ADD

  });



  socket.on("offer", ({ offer, meetingId }) => {
    socket.to(meetingId).emit("offer", { offer, from: socket.id }); // CHANGE
});
    



  socket.on("answer", ({ answer, meetingId }) => {
    socket.to(meetingId).emit("answer", { answer, from: socket.id }); // CHANGE
});

    


  socket.on("ice-candidate", ({ candidate, meetingId }) => {
     socket.to(meetingId).emit("ice-candidate", { candidate, from: socket.id }); // CHANGE
});
    



  socket.on("end-meeting", async ({ meetingId, summaryHash }) => {
    try {
      console.log(`Storing hash for meeting ${meetingId} on blockchain...`);
      const tx = await contract.storeHash(meetingId, summaryHash);
      await tx.wait();
      console.log(`✅ Stored on-chain! Tx: ${tx.hash}`);
      socket.emit("meeting-ended-onchain", { meetingId, txHash: tx.hash }); // ADD

    } catch (err) {
      console.error("❌ Blockchain storage failed:", err.message);
      socket.emit("meeting-end-failed", { meetingId, error: err.message }); // ADD
  

    }



  });

socket.on("send-file", ({ meetingId, fileName, fileData }) => {
    socket.to(meetingId).emit("receive-file", { fileName, fileData });
  });

  socket.on("chat-message", ({ meetingId, message, sender }) => {
    socket.to(meetingId).emit("chat-message", { message, sender });
  });

socket.on("whiteboard-draw", ({ meetingId, data }) => {
    socket.to(meetingId).emit("whiteboard-draw", data);
  });



  





}); // 👈 YE CLOSING BRACKET MISSING THI — io.on("connection") ko close karti hai

server.listen(3001, '0.0.0.0', () => {
  console.log("NexusFlow Server running on 0.0.0.0:3001");
});