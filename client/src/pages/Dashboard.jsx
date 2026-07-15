import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMeeting, checkMeeting } from "../utils/api";
import { Link2, Check, MessageCircle, X } from "lucide-react";

export default function Dashboard() {
  const [joinId, setJoinId] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState(null); // 👈 shows the share modal when set
  const [linkCopied, setLinkCopied] = useState(false);
  const navigate = useNavigate();

  const walletAddress = localStorage.getItem("walletAddress") || "";

  const handleCreate = async () => {
    setError("");
    setCreating(true);
    try {
      const res = await createMeeting(walletAddress);
      setCreatedMeetingId(res.data.meetingId); // 👈 show share modal instead of navigating immediately
      setCreating(false);
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("ERROR RESPONSE:", err.response);
      console.log("ERROR MESSAGE:", err.message);

      setError(err.response?.data?.error || "Could not create meeting");
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    setError("");
    setJoining(true);
    try {
      await checkMeeting(joinId.trim());
      navigate(`/meeting/${joinId.trim()}`);
    } catch (err) {
      setError(err.response?.data?.error || "Meeting not found");
      setJoining(false);
    }
  };

  const meetingLink = createdMeetingId
    ? `${window.location.origin}/meeting/${createdMeetingId}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Join my blockmeet meeting: ${meetingLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const joinCreatedMeeting = () => {
    navigate(`/meeting/${createdMeetingId}`, { state: { isHost: true } });
  };

  const closeModal = () => {
    setCreatedMeetingId(null);
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col items-center px-5 py-10">
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-16">
        <h1 className="font-display text-xl font-bold">BLOCKMEET</h1>
        <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-4 py-1.5 font-mono text-xs text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
        </div>
      </div>

      {/* Main actions */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Create meeting */}
        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col">
          <h2 className="font-display text-lg font-semibold mb-1.5">Start a meeting</h2>
          <p className="text-textMuted text-sm leading-relaxed mb-6 flex-1">
            Create a new room instantly. You'll get a unique, verified link to share.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-accent hover:bg-[#7C6CF0] disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Creating room...
              </>
            ) : (
              "Create a new meeting"
            )}
          </button>
        </div>

        {/* Join meeting */}
        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col">
          <h2 className="font-display text-lg font-semibold mb-1.5">Join a meeting</h2>
          <p className="text-textMuted text-sm leading-relaxed mb-4">
            Enter the meeting ID someone shared with you.
          </p>
          <form onSubmit={handleJoin} className="flex flex-col flex-1">
            <input
              type="text"
              placeholder="Meeting ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-accent transition font-mono"
            />
            <button
              type="submit"
              disabled={joining}
              className="w-full border border-border hover:border-accent disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-lg transition mt-auto flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <span className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin"></span>
                  Joining...
                </>
              ) : (
                "Join meeting"
              )}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Zoom-style "share this meeting" modal */}
      {createdMeetingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-textMuted hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-display text-lg font-semibold mb-2">Meeting created</h3>
            <p className="text-textMuted text-sm mb-4">
              Share this joining info with people you want in the meeting.
            </p>

            <div className="bg-bg border border-border rounded-lg px-4 py-3 mb-4 font-mono text-xs break-all text-accent">
              {meetingLink}
            </div>

            <div className="flex gap-3 mb-5">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 border border-border hover:border-accent rounded-lg py-2.5 text-sm font-semibold transition"
              >
                {linkCopied ? <Check size={16} /> : <Link2 size={16} />}
                {linkCopied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 rounded-lg py-2.5 text-sm font-semibold transition"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
            </div>

            <button
              onClick={joinCreatedMeeting}
              className="w-full bg-accent hover:bg-[#7C6CF0] rounded-lg py-3 text-sm font-semibold transition"
            >
              Join Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}