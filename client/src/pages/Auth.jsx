import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, verifyOtp } from "../utils/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
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
        // Registration no longer creates the account immediately —
        // it sends an OTP first. Move to the OTP-entry step.
        await registerUser(identifier, password);
        setStep("otp");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // OTP correct — account now actually exists. Log in right after.
      await verifyOtp(identifier, otp);
      const res = await loginUser(identifier, password);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      navigate("/verify-wallet");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col items-center justify-center px-5">
      <div className="animate-entrance w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-4">BLOCKMEET</h1>

          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-1 rounded-full bg-accent"></div>
            <div className="w-6 h-1 rounded-full bg-border"></div>
            <div className="w-6 h-1 rounded-full bg-border"></div>
          </div>
          <div className="text-accent font-mono text-xs uppercase tracking-wider">
            Step 1 of 3 — Account
          </div>
        </div>

        {/* OTP step */}
        {step === "otp" ? (
          <form
            onSubmit={handleVerifyOtp}
            className="bg-surface border border-border rounded-xl p-7 shadow-xl shadow-black/20"
          >
            <h2 className="font-display text-lg font-semibold mb-1">Check your email</h2>
            <p className="text-textMuted text-xs mb-5">
              We sent a 6-digit code to <span className="text-white">{identifier}</span>.
              It expires in 10 minutes.
            </p>

            <label className="block text-xs text-textMuted mb-1.5">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-center text-lg tracking-[0.5em] font-mono outline-none focus:border-accent transition"
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-accent hover:bg-[#7C6CF0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-lg transition mt-5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Verifying...
                </>
              ) : (
                "Verify & continue"
              )}
            </button>

            <p className="text-center text-textMuted text-sm mt-5">
              Wrong email?{" "}
              <span
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  setError("");
                }}
                className="text-accent cursor-pointer hover:underline"
              >
                Go back
              </span>
            </p>
          </form>
        ) : (
          /* Email + password step */
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

            <label className="block text-xs text-textMuted mb-1.5">Email address</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-accent transition"
            />

            <label className="block text-xs text-textMuted mb-1.5">Password</label>
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
                  {isLogin ? "Logging in..." : "Sending code..."}
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
        )}
      </div>
    </div>
  );
}