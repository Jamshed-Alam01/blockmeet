import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export default function PreJoin() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((s) => {
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    });
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((v) => !v);
  };

  const joinNow = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate(`/meeting/${meetingId}/room`, {
      state: {
        micOn,
        camOn,
        isHost: location.state?.isHost ?? false, // carry the host flag forward
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="font-display text-2xl font-semibold">Ready to join?</h1>

      <div className="w-full max-w-md aspect-video bg-surface border border-border rounded-xl overflow-hidden relative">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {!camOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <VideoOff size={32} className="text-textMuted" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${micOn ? "bg-surface border border-border" : "bg-red-500/20 border border-red-500/40 text-red-400"}`}
        >
          {micOn ? <Mic size={16} /> : <MicOff size={16} />}
          {micOn ? "Mic on" : "Mic off"}
        </button>
        <button
          onClick={toggleCam}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${camOn ? "bg-surface border border-border" : "bg-red-500/20 border border-red-500/40 text-red-400"}`}
        >
          {camOn ? <Video size={16} /> : <VideoOff size={16} />}
          {camOn ? "Camera on" : "Camera off"}
        </button>
      </div>

      <button onClick={joinNow} className="bg-accent hover:bg-[#7C6CF0] px-8 py-3 rounded-lg font-semibold transition">
        Join Meeting
      </button>
    </div>
  );
}