import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import VerifyWallet from "./pages/VerifyWallet";
import Dashboard from "./pages/Dashboard";
import PreJoin from "./pages/PreJoin";
import MeetingRoom from "./pages/MeetingRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify-wallet" element={<VerifyWallet />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/meeting/:meetingId" element={<PreJoin />} />
      <Route path="/meeting/:meetingId/room" element={<MeetingRoom />} />
    </Routes>
  );
}

export default App;