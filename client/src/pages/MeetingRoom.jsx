import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { socket } from "../utils/socket";
import { keccak256, toUtf8Bytes } from "ethers";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  PenTool,
  MessageSquare,
  FolderOpen,
  PhoneOff,
  Link2,
  Check,
  ShieldCheck,
} from "lucide-react";

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Passed from PreJoin / Dashboard navigation state
  const initialMic = location.state?.micOn ?? true;
  const initialCam = location.state?.camOn ?? true;
  const isHost = location.state?.isHost ?? false; // 👈 only true if this user created the meeting

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // { socketId: RTCPeerConnection }
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: MediaStream }
  const [micOn, setMicOn] = useState(initialMic);
  const [camOn, setCamOn] = useState(initialCam);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [panel, setPanel] = useState(null); // null | "whiteboard" | "chat" | "files"
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [files, setFiles] = useState([]);

  const [savingProof, setSavingProof] = useState(false);
  const [proofResult, setProofResult] = useState(null); // { txHash } | { error }
  const [linkCopied, setLinkCopied] = useState(false);

  const myId = useRef(Math.random().toString(36).slice(2, 8));

  // ---- Setup: get camera/mic, connect socket, join room ----
  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      console.log("Using mic:", stream.getAudioTracks()[0]?.label);


      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Apply PreJoin lobby choices
      if (!initialMic) stream.getAudioTracks().forEach((t) => (t.enabled = false));
      if (!initialCam) stream.getVideoTracks().forEach((t) => (t.enabled = false));

      socket.connect();
      socket.emit("join-room", meetingId);
      console.log("🟢 MY socket ID sent join-room for meetingId:", meetingId);





      socket.on("user-connected", (userId) => {
        console.log("🔵 Someone else joined:", userId);

        createPeer(userId, true);
      });

      socket.on("offer", async ({ offer, from }) => {
        const pc = createPeer(from, false);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { answer, meetingId, to: from });
      });

      socket.on("answer", async ({ answer, from }) => {
        const pc = peersRef.current[from];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", ({ candidate, from }) => {
        const pc = peersRef.current[from];
        if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("user-disconnected", (userId) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
      });

      socket.on("whiteboard-draw", (data) => drawRemote(data));

socket.on("chat-message", ({ message, sender }) => {
    console.log("📥 Received chat:", message, "from:", sender);
    setMessages((prev) => [...prev, { message, sender, self: false }]);
});

      




      socket.on("receive-file", ({ fileName, fileData }) => {
        setFiles((prev) => [...prev, { fileName, fileData, self: false }]);
      });

      socket.on("meeting-ended-onchain", ({ txHash }) => {
        setSavingProof(false);
        setProofResult({ txHash });
      });

      socket.on("meeting-end-failed", ({ error }) => {
        setSavingProof(false);
        setProofResult({ error });
      });
    };

    init();

    return () => {
      Object.values(peersRef.current).forEach((pc) => pc.close());
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);



  // ---- WebRTC peer creation ----
  const createPeer = (userId, isInitiator) => {
    if (peersRef.current[userId]) return peersRef.current[userId];

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE state (${userId}):`, pc.iceConnectionState);
    };

    localStreamRef.current
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current));



    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { candidate: e.candidate, meetingId, to: userId });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [userId]: e.streams[0] }));
    };

    peersRef.current[userId] = pc;

    if (isInitiator) {
      pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
        socket.emit("offer", { offer, meetingId, to: userId });
      });
    }

    return pc;
  };

  // ---- Controls ----
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!sharingScreen) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setSharingScreen(true);

      screenTrack.onended = () => stopScreenShare();
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    Object.values(peersRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    setSharingScreen(false);
  };

  const leaveMeeting = () => {
    Object.values(peersRef.current).forEach((pc) => pc.close());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    socket.disconnect();
    navigate("/dashboard");
  };

  // ---- Whiteboard ----
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    drawingRef.current = true;
    const { x, y } = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    const { x, y } = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#6C5CE0";
    ctx.lineWidth = 2;
    ctx.stroke();
    socket.emit("whiteboard-draw", { meetingId, data: { x, y, type: "draw" } });
  };

  const stopDraw = () => {
    drawingRef.current = false;
  };

  const drawRemote = ({ x, y, type }) => {
    const ctx = canvasRef.current.getContext("2d");
    if (type === "draw") {
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#6C5CE0";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const clearWhiteboard = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    console.log("📤 Sending chat:", chatInput, "to meetingId:", meetingId);
    socket.emit("chat-message", { meetingId, message: chatInput, sender: myId.current });
    setMessages((prev) => [...prev, { message: chatInput, sender: "You", self: true }]);
    setChatInput("");
};

  




  // ---- File sharing ----
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("send-file", { meetingId, fileName: file.name, fileData: reader.result });
      setFiles((prev) => [...prev, { fileName: file.name, fileData: reader.result, self: true }]);
    };
    reader.readAsDataURL(file);
  };

  // ---- Blockchain: end meeting & store proof (host only) ----
  const generateSummaryHash = () => {
    const summary = JSON.stringify({
      meetingId,
      endedAt: new Date().toISOString(),
      participants: [myId.current, ...Object.keys(remoteStreams)],
      messageCount: messages.length,
      filesShared: files.length,
    });
    return keccak256(toUtf8Bytes(summary));
  };

  const endMeetingAndSaveProof = () => {
    setSavingProof(true);
    setProofResult(null);
    const summaryHash = generateSummaryHash();
    socket.emit("end-meeting", { meetingId, summaryHash });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href.replace("/room", ""));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const remoteEntries = Object.entries(remoteStreams);

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="font-display font-semibold">BLOCKMEET</span>
        <div className="flex items-center gap-3">
          {isHost && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <ShieldCheck size={14} /> Host
            </span>
          )}
          <span className="font-mono text-xs text-textMuted">Room: {meetingId.slice(0, 8)}</span>
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-white/5"
          >
            {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
            {linkCopied ? "Copied!" : "Copy invite link"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl overflow-hidden relative aspect-video">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!camOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface">
                <VideoOff size={32} className="text-textMuted" />
              </div>
            )}
            <span className="absolute bottom-2 left-2 flex items-center gap-1.5 text-xs bg-black/60 px-2 py-1 rounded font-mono">
              {!micOn && <MicOff size={12} className="text-red-400" />}
              You {sharingScreen && "(sharing screen)"}
            </span>
          </div>

          {remoteEntries.map(([id, stream]) => (
            <RemoteVideo key={id} stream={stream} />
          ))}
        </div>

        {/* Side panel */}
        {panel && (
          <div className="w-80 border-l border-border flex flex-col">
            {panel === "whiteboard" && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold">Whiteboard</span>
                  <button onClick={clearWhiteboard} className="text-xs text-textMuted hover:text-white">
                    Clear
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={500}
                  className="bg-white cursor-crosshair flex-1"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                />
              </div>
            )}

            {panel === "chat" && (
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b border-border text-sm font-semibold">Chat</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`text-xs ${m.self ? "text-accent" : "text-textMuted"}`}>
                      <span className="font-semibold">{m.self ? "You" : "Peer"}: </span>
                      {m.message}
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                  <button type="submit" className="bg-accent text-xs px-3 rounded-lg">
                    Send
                  </button>
                </form>
              </div>
            )}

            {panel === "files" && (
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b border-border text-sm font-semibold">Files</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {files.map((f, i) => (
                    <a
                      key={i}
                      href={f.fileData}
                      download={f.fileName}
                      className="block text-xs text-accent hover:underline truncate"
                    >
                      {f.fileName} {f.self && "(sent)"}
                    </a>
                  ))}
                </div>
                <label className="p-3 border-t border-border text-xs text-center cursor-pointer hover:bg-white/5">
                  <input type="file" onChange={handleFileSelect} className="hidden" />
                  + Upload file to share
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proof result banner */}
      {proofResult && (
        <div className="px-6 py-3 bg-surface border-t border-border text-xs">
          {proofResult.txHash ? (
            <span className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={14} />
              Proof stored on-chain —{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${proofResult.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on Etherscan
              </a>
            </span>
          ) : (
            <span className="text-red-400">Failed to store proof: {proofResult.error}</span>
          )}
        </div>
      )}

      {/* Control bar */}
      <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-border flex-wrap">
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${micOn ? "bg-surface border border-border" : "bg-red-500/20 border border-red-500/40 text-red-400"}`}
        >
          {micOn ? <Mic size={16} /> : <MicOff size={16} />}
          {micOn ? "Mute" : "Unmute"}
        </button>
        <button
          onClick={toggleCam}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${camOn ? "bg-surface border border-border" : "bg-red-500/20 border border-red-500/40 text-red-400"}`}
        >
          {camOn ? <Video size={16} /> : <VideoOff size={16} />}
          {camOn ? "Camera off" : "Camera on"}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${sharingScreen ? "bg-accent" : "bg-surface border border-border"}`}
        >
          {sharingScreen ? <ScreenShareOff size={16} /> : <ScreenShare size={16} />}
          {sharingScreen ? "Stop sharing" : "Share screen"}
        </button>
        <button
          onClick={() => setPanel(panel === "whiteboard" ? null : "whiteboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${panel === "whiteboard" ? "bg-accent" : "bg-surface border border-border"}`}
        >
          <PenTool size={16} />
          Whiteboard
        </button>
        <button
          onClick={() => setPanel(panel === "chat" ? null : "chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${panel === "chat" ? "bg-accent" : "bg-surface border border-border"}`}
        >
          <MessageSquare size={16} />
          Chat
        </button>
        <button
          onClick={() => setPanel(panel === "files" ? null : "files")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${panel === "files" ? "bg-accent" : "bg-surface border border-border"}`}
        >
          <FolderOpen size={16} />
          Files
        </button>

        {isHost && (
          <button
            onClick={endMeetingAndSaveProof}
            disabled={savingProof}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            {savingProof ? "Saving proof..." : "End Meeting & Save Proof"}
          </button>
        )}

        <button
          onClick={leaveMeeting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600"
        >
          <PhoneOff size={16} />
          Leave
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
      ref.current.play().catch((err) => {
        console.error("🔇 Autoplay blocked:", err.name, err.message);
      });
    }





    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setMuted(audioTrack ? !audioTrack.enabled : false);
    setCamOff(videoTrack ? !videoTrack.enabled : false);

    const interval = setInterval(() => {
      setMuted(audioTrack ? !audioTrack.enabled : false);
      setCamOff(videoTrack ? !videoTrack.enabled : false);
    }, 1000);

    return () => clearInterval(interval);
  }, [stream]);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden relative aspect-video">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      {camOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <VideoOff size={32} className="text-textMuted" />
        </div>
      )}
      {muted && (
        <span className="absolute bottom-2 left-2 flex items-center gap-1 text-xs bg-black/60 px-2 py-1 rounded font-mono">
          <MicOff size={12} className="text-red-400" />
        </span>
      )}
    </div>
  );
}