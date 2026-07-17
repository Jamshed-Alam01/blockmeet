import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../utils/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const res = await loginUser(identifier, password);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        navigate("/verify-wallet");
      } else {
        // Registration now creates the account directly, then logs in.
        await registerUser(identifier, password);
        const res = await loginUser(identifier, password);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        navigate("/verify-wallet");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col items-center justify-center px-5">
      <div className="animate-entrance w-full max-w-md">

<div className="text-center mb-10">
  <h1 className="font-display text-4xl font-bold tracking-wide text-white">
    BLOCKMEET
  </h1>

  <p className="mt-3 text-gray-400 text-base leading-relaxed max-w-sm mx-auto">
    Secure video meetings powered by
    <span className="text-accent font-medium">
      {" "}Blockchain
    </span>
    {" "}and Wallet Authentication.
  </p>

  <div className="flex justify-center gap-6 mt-5 text-xs text-gray-500">
    <span>🔒 Secure</span>
    <span>⚡ Fast</span>
    <span>⛓ Verified</span>
  </div>
</div>
        



        {/* Email + password step */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-7 shadow-xl shadow-black/20"
        >
          <h2 className="font-display text-lg font-semibold mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-textMuted text-xs mb-5">
            {isLogin
              ? "Log in to continue to your meetings."
              : "Takes less than a minute."}
          </p>

          <label className="block text-xs text-textMutedmb-1.5">Email address</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoFocus
            className="w-full bg-bg border border-borderrounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-accent transition"
          />

          <label className="block text-xs text-textMutedmb-1.5">Password</label>
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 pr-16 text-sm outline-none focus:border-accent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-white text-xs transition"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-[#7C6CF0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-lg transition mt-5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                {isLogin ? "Logging in..." : "Creating account..."}
              </>
            ) : isLogin ? (
              "Log in"
            ) : (
              "Create account"
            )}
          </button>

          <p className="text-center text-textMuted text-sm mt-5">
            {isLogin ? "New here? " : "Already have an account? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-accent cursor-pointer hover:underline"
            >
              {isLogin ? "Create an account" : "Log in"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}