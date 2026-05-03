import React, { useState, useEffect, useRef, useCallback } from "react";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import agoraService, { type AgoraConfig } from "@/services/agoraService";
import { Mic, MicOff, Video, VideoOff, Phone, Radio, ScreenShare, ScreenShareOff, AlertTriangle, Users } from "lucide-react";
import { toast } from "react-toastify";
import { startRecordingForBooking, stopRecordingForBooking } from "@/helpers/agoraApi";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const THUMB_W = 192;
const THUMB_H = 144;
const MARGIN = 24;
const TOTAL_MINUTES = 60;

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
interface VideoCallProps {
  appId: string;
  channel: string;
  token: string | null;
  uid: string | number;
  tokenExpiresAt?: number;
  userName?: string;
  avatarUrl?: string | null;
  remoteUserName?: string;
  remoteAvatarUrl?: string | null;
  onLeave?: () => void;
  bookingId?: number;
}

// ──────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getMeetingStartKey(channel: string) {
  return `imate_meetingStart_${channel}`;
}

// ──────────────────────────────────────────────
// Avatar placeholder
// ──────────────────────────────────────────────
const AvatarPlaceholder: React.FC<{ name: string; size?: "sm" | "md" | "lg" }> = ({ name, size = "md" }) => {
  const sizeClass = {
    sm: "w-16 h-16 text-2xl",
    md: "w-28 h-28 text-4xl",
    lg: "w-40 h-40 text-6xl",
  }[size];
  return (
    <div className={`${sizeClass} rounded-full border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/50`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
const VideoCall: React.FC<VideoCallProps> = ({
  appId, channel, token, uid, tokenExpiresAt,
  userName = "Bạn", avatarUrl = null,
  remoteUserName = "Đối phương", remoteAvatarUrl = null,
  onLeave, bookingId,
}) => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<Map<string | number, IAgoraRTCRemoteUser>>(new Map());
  const [isSharing, setIsSharing] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [screenOwnerUid, setScreenOwnerUid] = useState<string | number | null>(null);
  const [isAgoraRecording, setIsAgoraRecording] = useState(false);
  const [countdown, setCountdown] = useState(TOTAL_MINUTES * 60);
  const [tokenTimeRemaining, setTokenTimeRemaining] = useState<number | null>(null);
  const tokenWarningShownRef = useRef({ fiveMinutes: false, oneMinute: false });

  const localVideoRef = useRef<HTMLDivElement>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const remoteVideosRef = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const countdownIntervalRef = useRef<number | null>(null);

  // draggable local thumbnail
  const [localPos, setLocalPos] = useState({ left: 0, top: 0 });
  const localThumbRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Position init ──
  useEffect(() => {
    const setDefault = () => {
      setLocalPos({
        left: Math.max(window.innerWidth - MARGIN - THUMB_W, MARGIN),
        top: Math.max(window.innerHeight - MARGIN - THUMB_H - 80, MARGIN),
      });
    };
    setDefault();
    window.addEventListener("resize", setDefault);
    return () => window.removeEventListener("resize", setDefault);
  }, []);

  // ── Drag handlers ──
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!localThumbRef.current) return;
    isDragging.current = true;
    const rect = localThumbRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!isDragging.current) return;
      setLocalPos({
        left: Math.max(MARGIN, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - THUMB_W - MARGIN)),
        top: Math.max(MARGIN, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - THUMB_H - MARGIN)),
      });
    };
    const up = () => { isDragging.current = false; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  // ── Countdown ──
  useEffect(() => {
    if (!joined) {
      setCountdown(TOTAL_MINUTES * 60);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }
    let startTime = localStorage.getItem(getMeetingStartKey(channel));
    const now = Date.now();
    
    // Fix: If startTime existed from more than 2 hours ago, reset it (stale data bug)
    if (startTime) {
      const oldTime = parseInt(startTime, 10);
      if (now - oldTime > 2 * 60 * 60 * 1000) {
        console.log("ðŸ”µ Stale countdown found, resetting...");
        localStorage.removeItem(getMeetingStartKey(channel));
        startTime = null;
      }
    }

    if (!startTime) {
      localStorage.setItem(getMeetingStartKey(channel), now.toString());
      startTime = now.toString();
    }
    const startMs = parseInt(startTime, 10);
    const update = () => {
      const passed = Math.floor((Date.now() - startMs) / 1000);
      setCountdown(Math.max(TOTAL_MINUTES * 60 - passed, 0));
    };
    update();
    countdownIntervalRef.current = setInterval(update, 1000);
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [joined, channel]);

  // ── Token expiration ──
  useEffect(() => {
    if (!tokenExpiresAt || !joined) {
      setTokenTimeRemaining(null);
      tokenWarningShownRef.current = { fiveMinutes: false, oneMinute: false };
      return;
    }
    tokenWarningShownRef.current = { fiveMinutes: false, oneMinute: false };
    const check = () => {
      const remaining = tokenExpiresAt - Math.floor(Date.now() / 1000);
      setTokenTimeRemaining(remaining > 0 ? remaining : 0);
      if (remaining <= 300 && remaining > 60 && !tokenWarningShownRef.current.fiveMinutes) {
        tokenWarningShownRef.current.fiveMinutes = true;
        toast.warning(`Buổi phỏng vấn sẽ kết thúc sau ${Math.floor(remaining / 60)} phút.`, { autoClose: 10000 });
      }
      if (remaining <= 60 && remaining > 0 && !tokenWarningShownRef.current.oneMinute) {
        tokenWarningShownRef.current.oneMinute = true;
        toast.error(`Buổi phỏng vấn sẽ kết thúc sau ${remaining} giây!`, { autoClose: 15000 });
      }
      if (remaining <= 0) {
        toast.error("Token đã hết hạn. Cuộc gọi sẽ tự động kết thúc.", { autoClose: 5000 });
        setTimeout(() => onLeave?.(), 2000);
      }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [tokenExpiresAt, joined, onLeave]);

  // ── Agora init ──
  useEffect(() => {
    try {
      agoraService.initializeClient();
      agoraService.removeAllListeners(); // Clean up old listeners before setting up new ones
      agoraService.setupEventListeners(
        (user, mediaType) => {
          console.log(`ðŸ”µ Remote user ${user.uid} published ${mediaType}`);
          setRemoteUsers(prev => new Map(prev).set(user.uid, user));
          setTimeout(() => {
            if (mediaType === "video") {
              const list: any[] = (user as any).videoTrackList || (user.videoTrack ? [user.videoTrack] : []);
              const getLabel = (t: any) => t?.getMediaStreamTrack?.().label?.toLowerCase?.() || "";
              const screenTrack = list.find(t => { const l = getLabel(t); return l.includes("screen") || l.includes("display") || l.includes("monitor"); });
              const cameraTrack = list.find(t => { const l = getLabel(t); return l && !l.includes("screen") && !l.includes("display") && !l.includes("monitor"); }) || (user as any).videoTrack;

              if (screenTrack && screenContainerRef.current) {
                setScreenOwnerUid(user.uid);
                try { screenTrack.play(screenContainerRef.current); } catch {}
              }
              const camContainer = remoteVideosRef.current.get(user.uid);
              if (camContainer && cameraTrack) {
                try { cameraTrack.play(camContainer); } catch {}
              }
            } else if (mediaType === "audio") {
              agoraService.playRemoteAudio(user);
            }
          }, 100);
        },
        (user, mediaType) => {
          if (mediaType === "video" || mediaType === undefined) {
            if (screenOwnerUid === user.uid) setScreenOwnerUid(null);
            setRemoteUsers(prev => {
              const next = new Map(prev);
              if (mediaType === undefined) next.delete(user.uid);
              return next;
            });
          }
        }
      );
    } catch (err) {
      console.error("â Œ Agora: Error in setupEventListeners:", err);
    }
    return () => { if (agoraService.getIsJoined()) agoraService.leaveChannel(); };
  }, []);

  useEffect(() => {
    if (joined && localVideoRef.current) {
      try { 
        console.log("ðŸ”µ Agora: Playing local video");
        agoraService.playLocalVideo(localVideoRef.current); 
      } catch (err) {
        console.error("â Œ Agora: Failed to play local video:", err);
      }
    }
  }, [joined]);

  useEffect(() => {
    if (isSharing && screenContainerRef.current) {
      try { 
        console.log("ðŸ”µ Agora: Playing screen share");
        agoraService.playLocalScreenVideo(screenContainerRef.current); 
        setScreenOwnerUid("local"); 
      } catch (err) {
        console.error("â Œ Agora: Failed to play screen share:", err);
      }
    } else if (!isSharing && screenOwnerUid === "local") {
      setScreenOwnerUid(null);
      setTimeout(() => {
        if (localVideoRef.current && !videoMuted) {
          try { agoraService.playLocalVideo(localVideoRef.current); } catch {}
        }
      }, 100);
    }
  }, [isSharing, videoMuted]);

  // ── Recording ──
  const handleStartRecording = useCallback(async () => {
    if (!bookingId) return;
    try {
      console.log("ðŸ”µ Agora: Calling StartRecordingForBooking...");
      await startRecordingForBooking(bookingId);
      setIsAgoraRecording(true);
      console.log("âœ… Agora: Recording started successfully");
    } catch (err) { 
      console.error("â Œ Agora: Failed to start recording:", err);
    }
  }, [bookingId]);

  const handleStopRecording = useCallback(async () => {
    if (!bookingId) return;
    try {
      setIsAgoraRecording(false);
      await stopRecordingForBooking(bookingId);
    } catch { setIsAgoraRecording(true); }
  }, [bookingId]);

  const remoteUsersArray = Array.from(remoteUsers.values());

  useEffect(() => {
    if (!bookingId || !joined) return;
    const count = 1 + remoteUsers.size;
    console.log(`ðŸ”µ Agora: Participant count: ${count} (Remote: ${remoteUsers.size})`);
    if (count >= 2 && !isAgoraRecording) {
      console.log("ðŸ”µ Agora: Triggering StartRecording...");
      handleStartRecording();
    }
    if (count < 2 && isAgoraRecording) {
      console.log("ðŸ”µ Agora: Triggering StopRecording...");
      handleStopRecording();
    }
  }, [remoteUsers.size, joined, bookingId, isAgoraRecording, handleStartRecording, handleStopRecording]);

  // ── Join / Leave ──
  const handleJoin = async () => {
    if (loading || joined) return;
    setLoading(true);
    try {
      const config: AgoraConfig = { appId, channel, token, uid: uid.toString() };
      await agoraService.joinChannel(config);
      try {
        await agoraService.createLocalTracks();
        await agoraService.publishLocalTracks();
      } catch (err: any) {
        await agoraService.leaveChannel().catch(() => {});
        if (err?.name === "NotAllowedError") toast.error("Vui lòng cấp quyền truy cập microphone và camera.", { autoClose: 7000 });
        else if (err?.name === "NotFoundError") toast.error("Không tìm thấy thiết bị camera/microphone.", { autoClose: 7000 });
        else toast.error(`Lỗi thiết bị: ${err?.message || "Không xác định"}`, { autoClose: 7000 });
        throw err;
      }
      setJoined(true);
      
      // Manual Sync: Check for any users already in the channel
      const existingRemoteUsers = agoraService.getRemoteUsers();
      if (existingRemoteUsers.length > 0) {
        console.log(`ðŸ”µ Agora: Syncing ${existingRemoteUsers.length} existing remote users`);
        setRemoteUsers(prev => {
          const next = new Map(prev);
          existingRemoteUsers.forEach(user => {
            next.set(user.uid, user);
            // If they already have tracks, we might need to play them if events were missed
            if (user.hasVideo || user.hasAudio) {
               console.log(`ðŸ”µ Agora: User ${user.uid} already has tracks, triggering playback fallback`);
               // In some cases we might already be subscribed, so we can trigger the "onUserPublished" logic
               // However, setupEventListeners should handle this for net-new joins. 
               // For pre-existing, we just ensure they are in the state.
            }
          });
          return next;
        });
      }
    } catch (err: any) {
      if (err?.code === "INVALID_APP_ID") toast.error("App ID không hợp lệ.", { autoClose: 7000 });
      else if (err?.code === "INVALID_TOKEN") toast.error("Token không hợp lệ hoặc đã hết hạn.", { autoClose: 7000 });
      else if (!err?.name?.includes("NotAllowed") && !err?.name?.includes("NotFound"))
        toast.error(`Không thể tham gia cuộc gọi: ${err?.message || "Lỗi không xác định"}`, { autoClose: 7000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      if (isSharing) await agoraService.stopScreenShare().catch(() => {}); 
      setIsSharing(false);
      await agoraService.leaveChannel();
      setJoined(false);
      setRemoteUsers(new Map());
      onLeave?.();
    } catch {
      toast.error("Lỗi khi rời cuộc gọi. Vui lòng thử lại.");
    }
  };

  const toggleAudio = async () => { const next = !audioMuted; await agoraService.toggleAudio(next); setAudioMuted(next); };
  const toggleVideo = async () => { const next = !videoMuted; await agoraService.toggleVideo(next); setVideoMuted(next); };

  const toggleScreenShare = async () => {
    if (!joined) return;
    if (isSharing) {
      setShareMenuOpen(prev => !prev);
    } else {
      try {
        await agoraService.startScreenShare(false, () => {
          setIsSharing(false); setShareMenuOpen(false);
          setTimeout(() => { if (localVideoRef.current && !videoMuted) { try { agoraService.playLocalVideo(localVideoRef.current); } catch {} } }, 100);
        });
        setIsSharing(true); setShareMenuOpen(false);
      } catch (err: any) {
        if (err.code !== "PERMISSION_DENIED") toast.error("Không thể chia sẻ màn hình.");
        setIsSharing(false);
      }
    }
  };

  // ──────────────────────────────────────────────
  // RENDER: LOBBY
  // ──────────────────────────────────────────────
  if (!joined) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex items-center justify-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-800/15 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md mx-4">
          {/* Card */}
          <div className="bg-[#1A1A2E]/80 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-8 shadow-2xl shadow-indigo-950/50">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <Video className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-1">Phòng phỏng vấn</h1>
            <p className="text-gray-400 text-center text-sm mb-6">
              Phòng <span className="font-mono text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded-md">#{channel}</span>
            </p>

            {/* Participants info */}
            <div className="bg-[#0B0F19]/60 border border-indigo-900/20 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                {avatarUrl
                  ? <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30" />
                  : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-sm">{userName.charAt(0).toUpperCase()}</div>
                }
                <div>
                  <p className="text-white font-medium text-sm">{userName}</p>
                  <p className="text-indigo-300 text-xs">Bạn</p>
                </div>
              </div>
              <div className="border-t border-indigo-900/30" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-bold text-sm border-2 border-indigo-600/30">
                  {remoteUserName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{remoteUserName}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
                    Đang chờ...
                  </p>
                </div>
              </div>
            </div>

            {/* Join button */}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-base shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tham gia...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Tham gia phòng họp
                </>
              )}
            </button>
            <p className="text-gray-500 text-xs text-center mt-3">
              Bằng cách tham gia, bạn cho phép truy cập micro và camera
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // RENDER: IN-CALL
  // ──────────────────────────────────────────────
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#0B0F19]">
      <div className="absolute inset-0">

        {/* ── SCREEN SHARE MODE ── */}
        {isSharing || screenOwnerUid !== null ? (
          <div className="flex h-full w-full">
            {/* Shared screen */}
            <div className="relative h-full flex-1">
              <div ref={screenContainerRef} className="h-full w-full bg-[#060810] object-cover" />
              <div className="absolute top-5 left-5 flex items-center gap-2 bg-[#1A1A2E]/90 border border-indigo-900/30 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                <ScreenShare className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white">
                  {screenOwnerUid === "local" ? "Bạn đang chia sẻ màn hình" : `${remoteUserName} đang chia sẻ màn hình`}
                </span>
              </div>
            </div>

            {/* Side cameras */}
            <div className="flex h-full w-72 flex-col gap-3 p-3 bg-[#0E1120]">
              {/* Remote */}
              <div
                className="relative flex-1 overflow-hidden rounded-2xl border border-indigo-900/30 bg-[#1A1A2E] shadow-xl"
                ref={(el) => {
                  const camUser = remoteUsersArray[0];
                  if (el && camUser) {
                    remoteVideosRef.current.set(camUser.uid, el);
                    const list: any[] = (camUser as any).videoTrackList || (camUser.videoTrack ? [camUser.videoTrack] : []);
                    const getLabel = (t: any) => t?.getMediaStreamTrack?.().label?.toLowerCase?.() || "";
                    const track = list.find(t => { const l = getLabel(t); return l && !l.includes("screen") && !l.includes("display"); }) || (camUser as any).videoTrack;
                    if (track) { try { track.play(el); } catch {} }
                  }
                }}
              >
                {!remoteUsersArray[0]?.videoTrack && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/60 to-[#1A1A2E]">
                    {remoteAvatarUrl
                      ? <img src={remoteAvatarUrl} alt={remoteUserName} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/30 mb-2" />
                      : <AvatarPlaceholder name={remoteUserName} size="sm" />
                    }
                  </div>
                )}
                <NameBadge name={remoteUserName} />
              </div>

              {/* Local */}
              <div className="relative flex-1 overflow-hidden rounded-2xl border border-indigo-900/30 bg-[#1A1A2E] shadow-xl">
                <div ref={localVideoRef} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${videoMuted ? "opacity-0" : "opacity-100"}`} />
                {videoMuted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/60 to-[#1A1A2E]">
                    {avatarUrl
                      ? <img src={avatarUrl} alt={userName} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/30" />
                      : <AvatarPlaceholder name={userName} size="sm" />
                    }
                  </div>
                )}
                <NameBadge name={userName} isLocal />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── NORMAL MODE: Remote fullscreen ── */}
            <div
              className="absolute inset-0 h-full w-full bg-[#060810] object-cover"
              ref={(el) => { if (el && remoteUsersArray[0]) remoteVideosRef.current.set(remoteUsersArray[0].uid, el); }}
            />

            {/* Waiting / Remote placeholder */}
            {remoteUsersArray.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-[#1A1A2E]/80 border border-indigo-900/30 backdrop-blur-sm rounded-2xl px-8 py-6 text-center max-w-sm mx-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center">
                      <Users className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-white font-bold text-lg mb-1">Đang chờ người tham gia</p>
                  <p className="text-gray-400 text-sm">Phòng sẽ tự động kết nối khi đủ người</p>
                  <div className="flex justify-center gap-1 mt-4">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              !remoteUsersArray[0]?.videoTrack && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {remoteAvatarUrl
                    ? <img src={remoteAvatarUrl} alt={remoteUserName} className="w-40 h-40 rounded-full object-cover border-2 border-indigo-500/30 shadow-2xl" />
                    : <AvatarPlaceholder name={remoteUserName} size="lg" />
                  }
                </div>
              )
            )}

            {/* Remote name top-left */}
            {remoteUsersArray.length > 0 && (
              <div className="absolute top-5 left-5">
                <div className="flex items-center gap-2 bg-[#1A1A2E]/90 border border-indigo-900/30 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">{remoteUserName}</span>
                </div>
              </div>
            )}

            {/* Local thumbnail – draggable */}
            <div
              ref={localThumbRef}
              onPointerDown={handlePointerDown}
              style={{ position: "absolute", left: `${localPos.left}px`, top: `${localPos.top}px`, width: THUMB_W, height: THUMB_H, touchAction: "none", zIndex: 40 }}
              className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#1A1A2E] shadow-2xl shadow-indigo-950/50 select-none cursor-grab active:cursor-grabbing"
            >
              <div ref={localVideoRef} className={`h-full w-full object-cover transition-opacity duration-200 ${videoMuted ? "opacity-0" : "opacity-100"}`} />
              {videoMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/70 to-[#1A1A2E]">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={userName} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30" />
                    : <AvatarPlaceholder name={userName} size="sm" />
                  }
                </div>
              )}
              <NameBadge name={userName} isLocal />
            </div>
          </>
        )}

        {/* ── COUNTDOWN TOP-CENTER ── */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30">
          <div className="flex items-center gap-2 bg-[#1A1A2E]/90 border border-indigo-900/30 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
            <Radio className={`w-4 h-4 ${countdown > 0 ? "animate-pulse text-indigo-400" : "text-red-400"}`} />
            <span className="text-sm font-semibold text-white tabular-nums">
              {countdown > 0 ? `Còn lại: ${formatTime(countdown)}` : "Hết giờ"}
            </span>
          </div>

          {/* Token warning */}
          {tokenTimeRemaining !== null && tokenTimeRemaining <= 300 && (
            <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-xl border text-white ${
              tokenTimeRemaining <= 60
                ? "bg-red-500/90 border-red-400/30"
                : "bg-orange-500/90 border-orange-400/30"
            }`}>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">
                {tokenTimeRemaining <= 60
                  ? `Token hết hạn sau: ${tokenTimeRemaining}s`
                  : `Token hết hạn sau: ${formatTime(tokenTimeRemaining)}`}
              </span>
            </div>
          )}
        </div>

        {/* ── CONTROLS BAR BOTTOM ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 -m-4 bg-[#0B0F19]/80 backdrop-blur-md rounded-2xl border border-indigo-900/20 shadow-2xl" />

          <div className="relative flex items-center gap-3 px-2">
            {/* Mic */}
            <ControlBtn onClick={toggleAudio} active={audioMuted} title={audioMuted ? "Bật micro" : "Tắt micro"}>
              {audioMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-gray-100" />}
            </ControlBtn>

            {/* Camera */}
            <ControlBtn onClick={toggleVideo} active={videoMuted} title={videoMuted ? "Bật camera" : "Tắt camera"}>
              {videoMuted ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-gray-100" />}
            </ControlBtn>

            {/* Screen share */}
            <div className="relative">
              <ControlBtn onClick={toggleScreenShare} sharing={isSharing} title={isSharing ? "Đang chia sẻ" : "Chia sẻ màn hình"}>
                {isSharing ? <ScreenShareOff className="w-5 h-5 text-white" /> : <ScreenShare className="w-5 h-5 text-gray-100" />}
              </ControlBtn>

              {isSharing && shareMenuOpen && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-52 bg-[#1A1A2E] border border-indigo-900/30 rounded-xl p-2 shadow-2xl shadow-indigo-950/50 z-50">
                  <button onClick={() => setShareMenuOpen(false)} className="w-full text-left px-3 py-2 text-sm text-white rounded-lg hover:bg-indigo-900/30 transition-colors">
                    Tiếp tục chia sẻ
                  </button>
                  <button onClick={async () => { await agoraService.stopScreenShare(); setIsSharing(false); setShareMenuOpen(false); setTimeout(() => { if (localVideoRef.current && !videoMuted) { try { agoraService.playLocalVideo(localVideoRef.current); } catch {} } }, 100); }} className="w-full text-left px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors mt-0.5">
                    Dừng chia sẻ
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-indigo-900/40 mx-1" />

            {/* Leave */}
            <button
              onClick={handleLeave}
              title="Rời cuộc gọi"
              className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-900/40 transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-5 h-5 text-white rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
const NameBadge: React.FC<{ name: string; isLocal?: boolean }> = ({ name, isLocal }) => (
  <div className="absolute right-2 bottom-2">
    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg bg-[#1A1A2E]/90 border backdrop-blur-sm text-white ${isLocal ? "border-indigo-500/30" : "border-indigo-900/30"}`}>
      {name}
    </span>
  </div>
);

interface ControlBtnProps {
  onClick: () => void;
  active?: boolean;
  sharing?: boolean;
  title?: string;
  children: React.ReactNode;
}
const ControlBtn: React.FC<ControlBtnProps> = ({ onClick, active, sharing, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${
      active
        ? "bg-red-500 hover:bg-red-600 shadow-red-900/30"
        : sharing
        ? "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-900/30"
        : "bg-[#1A1A2E] hover:bg-indigo-900/50 border border-indigo-900/30"
    }`}
  >
    {children}
  </button>
);

export default VideoCall;
