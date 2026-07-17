# 🚀 BlockMeet: Wallet-Verified Real-Time Meeting Platform

BlockMeet is a next-generation, privacy-focused meeting platform that integrates real-time communication with blockchain-based proof of authenticity. It ensures that meetings are secure, tamper-proof, and identity-verified.

## 🌟 Core Concept
BlockMeet solves the problem of unauthorized meeting access and fake participation by combining **MetaMask wallet signatures** for identity verification with **Ethereum (Sepolia) blockchain** for immutable meeting proof.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Real-time:** Socket.io, WebRTC
- **Blockchain:** Solidity, Hardhat, Ethers.js, Sepolia Testnet
- **Authentication:** JWT, Wallet-based Nonce Signature

## 🔑 Key Features
- **Wallet-Verified Identity:** Users verify via cryptographic signature, ensuring real users.
- **Tamper-Proof Meetings:** Meeting summaries (duration, participants, etc.) are hashed and anchored on the blockchain.
- **Privacy-Focused:** Only the cryptographic hash is stored on-chain; sensitive data remains off-chain.
- **Real-Time Collaboration:** Features include Video Call (WebRTC), Screen Sharing, Whiteboard, and File Sharing.

## ⚙️ Architecture Workflow
1. **Authentication:** User signs in via Email/OTP + Wallet signature.
2. **Real-time Communication:** Socket.io handles signaling for WebRTC video/audio calls.
3. **Blockchain Proof:** When a meeting ends, a hash of the meeting summary is generated and stored on the Ethereum Sepolia network, creating a permanent, verifiable audit trail.

---
*Designed & Developed by Jamshed Alam*