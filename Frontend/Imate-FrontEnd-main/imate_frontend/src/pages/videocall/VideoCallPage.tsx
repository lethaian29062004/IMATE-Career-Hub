import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoCall from "@/components/meeting/VideoCall";
import { getAgoraTokenForBooking } from "@/helpers/agoraApi";
import { useAuth } from "@/store/AuthContext";
import { getCandidateBookings, getMentorBookings } from "@/services/bookingCandidateService";
import type { BookingDetailResponse } from "@/types/response/booking.response";
import { Video, AlertCircle, ArrowLeft } from "lucide-react";

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────
const VideoCallPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCall, setShowCall] = useState(false);

  const [agoraConfig, setAgoraConfig] = useState<{
    appId: string;
    token: string | null;
    channel: string;
    uid: number;
    expiresAt?: number;
  } | null>(null);

  const [remoteInfo, setRemoteInfo] = useState<{ name: string; avatarUrl: string | null }>({
    name: "Đối phương",
    avatarUrl: null,
  });

  const goBack = () => {
    if (user?.role === "Mentor") navigate("/mentor/interview-schedule");
    else if (user?.role === "Candidate") navigate("/interview-schedule");
    else navigate("/");
  };

  // ── Load Agora token ──
  useEffect(() => {
    const load = async () => {
      if (!bookingId) { setError("Booking ID không hợp lệ"); setLoading(false); return; }
      setLoading(true);
      setError("");
      try {
        const res = await getAgoraTokenForBooking(parseInt(bookingId));

        if (!res.appId || res.appId.length !== 32) throw new Error("App ID không hợp lệ");
        if (res.token !== null && res.token.length === 0) throw new Error("Token rỗng");

        setAgoraConfig({
          appId: res.appId,
          token: res.token,
          channel: res.channelName,
          uid: res.uid,
          expiresAt: res.expiresAt,
        });
        setShowCall(true);
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin phòng họp. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  // ── Load remote user info ──
  useEffect(() => {
    const loadRemote = async () => {
      if (!bookingId || !user) return;
      try {
        if (user.role === "Mentor") {
          const data = await getMentorBookings();
          const booking = data.find((b: BookingDetailResponse) => String(b.bookingId) === bookingId);
          if (booking) { setRemoteInfo({ name: booking.profileName || "Ứng viên", avatarUrl: booking.profileAvatarUrl || null }); return; }
          setRemoteInfo({ name: "Ứng viên", avatarUrl: null });
        } else {
          const data = await getCandidateBookings();
          const booking = data.find((b: BookingDetailResponse) => String(b.bookingId) === bookingId);
          if (booking) { setRemoteInfo({ name: booking.profileName || "Mentor", avatarUrl: booking.profileAvatarUrl || null }); return; }
          setRemoteInfo({ name: "Mentor", avatarUrl: null });
        }
      } catch { /* fallback */ }
    };
    loadRemote();
  }, [bookingId, user]);

  const handleLeaveCall = () => {
    setShowCall(false);
    setAgoraConfig(null);
    goBack();
  };

  // ──────────────────────────────────────────────
  // States
  // ──────────────────────────────────────────────

  // Loading
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-900/50 mb-2">
          <Video className="w-8 h-8 text-white" />
        </div>
        <div className="w-10 h-10 border-2 border-indigo-900/40 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-white font-semibold text-lg">Đang chuẩn bị phòng họp...</p>
        <p className="text-gray-400 text-sm">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex items-center justify-center px-4">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-[#1A1A2E]/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Không thể kết nối</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{error}</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setError(""); setLoading(true); window.location.reload(); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all"
              >
                Thử lại
              </button>
              <button
                onClick={goBack}
                className="w-full py-3 rounded-xl bg-transparent hover:bg-indigo-900/20 border border-indigo-900/30 text-gray-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại lịch phỏng vấn
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Call
  if (showCall && agoraConfig) {
    return (
      <VideoCall
        appId={agoraConfig.appId}
        channel={agoraConfig.channel}
        token={agoraConfig.token}
        uid={agoraConfig.uid}
        tokenExpiresAt={agoraConfig.expiresAt}
        userName={user?.fullName || "Bạn"}
        avatarUrl={user?.avatarUrl || null}
        remoteUserName={remoteInfo.name}
        remoteAvatarUrl={remoteInfo.avatarUrl}
        onLeave={handleLeaveCall}
        bookingId={bookingId ? parseInt(bookingId) : undefined}
      />
    );
  }

  return null;
};

export default VideoCallPage;
