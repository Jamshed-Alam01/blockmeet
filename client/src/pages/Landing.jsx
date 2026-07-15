import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logo from "../assets/blockmeet-logo.png";
import { Wallet, Video, Link2, ShieldCheck } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-16">
        <section className="w-full max-w-5xl text-center animate-entrance">

          {/* Live badge */}
          <span className="inline-flex items-center gap-1.5 bg-success/10 border border-success/30 text-success text-xs font-mono px-4 py-1.5 rounded-full mb-8">
            <ShieldCheck size={13} />
            Live on Sepolia testnet
          </span>

          {/* Hero Logo + live text */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={logo} alt="" className="h-16 md:h-20 w-auto object-contain" />
            <span className="font-display font-bold text-5xl md:text-7xl tracking-tight">
              <span className="text-white">BLOCK</span>
              <span className="text-accentGlow">MEET</span>
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-textMuted text-lg mt-6 max-w-2xl mx-auto leading-8">
            Wallet-verified meetings secured on-chain.
            Create trusted video conferences with blockchain identity
            verification and tamper-proof meeting records.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate("/auth")}
            className="mt-10 bg-accent hover:bg-accentGlow transition-all duration-300 px-10 py-4 rounded-xl text-white font-semibold shadow-glow"
          >
            Get Started
          </button>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 text-left">
            <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/40 transition">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center mb-4">
                <Wallet size={18} className="text-accentGlow" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5">Sign in with your wallet</h3>
              <p className="text-textMuted text-xs leading-relaxed">
                No gas, no transaction — just a signature that proves who you are.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 hover:border-success/40 transition">
              <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center mb-4">
                <Video size={18} className="text-success" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5">Meet, share, whiteboard</h3>
              <p className="text-textMuted text-xs leading-relaxed">
                Video, screen share, files and a live whiteboard, all in one room.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/40 transition">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center mb-4">
                <Link2 size={18} className="text-accentGlow" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5">Anchor the proof</h3>
              <p className="text-textMuted text-xs leading-relaxed">
                The host writes a hash of the meeting to the chain. Permanent, tamper-proof.
              </p>
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}