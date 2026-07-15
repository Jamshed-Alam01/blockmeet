import { Link } from "react-router-dom";
import { Mail,  ShieldCheck } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="md:col-span-2">
          <Logo size={26} textSize="text-base" />
          <p className="text-sm text-textMuted mt-4 leading-relaxed max-w-xs">
            Wallet-verified video meetings with tamper-proof, on-chain proof of every session.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-success">
            <ShieldCheck size={14} />
            <span className="font-mono">Live on Sepolia testnet</span>
          </div>
        </div>

        {/* Company links */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm text-textMuted">
            <li>
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <a href="#features" className="hover:text-white transition">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-white transition">
                How it works
              </a>
            </li>
            <li>
              <a
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                View on Etherscan
              </a>
            </li>
          </ul>
        </div>

        {/* Get in touch */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Get in touch</h4>
          <ul className="space-y-2.5 text-sm text-textMuted">
            <li className="flex items-center gap-2">
              <Mail size={14} />
              <a href="mailto:hello@blockmeet.app" className="hover:text-white transition">
                hello@blockmeet.app
              </a>
            </li>
            
          </ul>
        </div>
      </div>

      {/* Store badges — decorative, BlockMeet is web-only for now */}
      <div className="max-w-5xl mx-auto px-6 pb-10 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 opacity-60 cursor-not-allowed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 3l10.5 6.4L3 15.8V3z" fill="#8B8D9B" />
            <path d="M13.5 9.4L17.5 12l-4 2.6-2-2.6 2-2.6z" fill="#8B8D9B" />
          </svg>
          <div className="text-left leading-tight">
            <p className="text-[10px] text-textMuted">Coming soon on</p>
            <p className="text-xs font-semibold text-textMuted">Google Play</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 opacity-60 cursor-not-allowed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#8B8D9B" aria-hidden="true">
            <path d="M16.7 12.4c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1 0 1.8-1 2.5-2 .6-.9.9-1.7.9-1.8-.1 0-2-.8-2-2.7z" />
            <path d="M14.9 6.1c.6-.7 1-1.7.9-2.6-.8 0-1.9.5-2.5 1.2-.6.6-1.1 1.6-.9 2.5.9.1 1.9-.4 2.5-1.1z" />
          </svg>
          <div className="text-left leading-tight">
            <p className="text-[10px] text-textMuted">Coming soon on</p>
            <p className="text-xs font-semibold text-textMuted">App Store</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-textMuted">
            © {new Date().getFullYear()} Jamshed Alam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}