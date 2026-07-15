import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { getNonce, verifyWallet } from "../utils/api";

export default function VerifyWallet() {
  const [status, setStatus] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleConnect = async () => {
    if (typeof window.ethereum === "undefined") {
      setStatus("MetaMask not found. Please install MetaMask.");
      return;
    }

    setIsVerifying(true);
    setStatus("Connecting wallet...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      setStatus("Waiting for signature in MetaMask...");

      const { data } = await getNonce(address);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(data.nonce);

      setStatus("Verifying signature...");

      const verifyRes = await verifyWallet(address, signature, user.identifier);

      if (verifyRes.data.success) {
        localStorage.setItem("walletAddress", address);
        setStatus("Wallet verified");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setStatus("Verification failed. Try again.");
        setIsVerifying(false);
      }
    } catch (err) {
      setStatus(err.response?.data?.error || "Signature rejected or failed.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <h1 className="font-display text-3xl font-bold mb-6">BLOCKMEET</h1>

      <div className="text-accent font-mono text-xs uppercase tracking-wider mb-3">
        Step 2 of 3 — Verify wallet
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 w-full max-w-md">
        {isVerifying ? (
          <div className="text-center py-5">
            <div className="w-9 h-9 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-textMuted text-sm">{status}</p>
          </div>
        ) : (
          <>
            <p className="text-textMuted text-sm leading-relaxed mb-6 text-center">
              Link your MetaMask wallet to your account. You'll sign a message
              to prove ownership — no gas fee, no transaction.
            </p>
            <button
              onClick={handleConnect}
              className="w-full bg-accent hover:bg-[#7C6CF0] text-white font-semibold text-sm py-3 rounded-lg transition"
            >
              Connect & verify wallet
            </button>
            {status && (
              <p className="text-red-400 text-xs mt-3 text-center">{status}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}