import { useNavigate } from "react-router-dom";
import logo from "../assets/blockmeet-logo.png"; // agar naam alag hai to yahan change kar dena

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="w-full fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

<button
  onClick={() => navigate("/")}
  className="flex items-center gap-2.5"
>
  <img
    src={logo}
    alt=""
    className="h-9 w-auto object-contain"
  />
  <span className="font-display font-bold text-xl tracking-tight">
    <span className="text-white">BLOCK</span>
    <span className="text-blue-500">MEET</span>
  </span>
</button>
        
        {/* Menu */}
        <nav className="hidden md:flex items-center gap-10 text-sm text-gray-300">
          <a href="#" className="hover:text-white transition">Features</a>
          <a href="#" className="hover:text-white transition">Security</a>
          <a href="#" className="hover:text-white transition">How it Works</a>
          <a href="#" className="hover:text-white transition">About</a>
        </nav>

        {/* Sign In */}
        <button
          onClick={() => navigate("/auth")}
          className="border border-gray-700 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
        >
          Sign In
        </button>

      </div>
    </header>
  );
}