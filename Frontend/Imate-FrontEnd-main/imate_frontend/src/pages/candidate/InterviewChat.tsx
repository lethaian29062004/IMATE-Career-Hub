import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, Mic, MicOff, Loader2, Bot } from "lucide-react";
import { toast } from "react-toastify";

import {
  getWelcomeMessage,
  generateQuestion,
  submitAnswer,
  endInterview,
  correctTranscript,
  type GenerateQuestionResponse,
  type WelcomeMessageResponse,
} from "@/services/interviewService";
import { recognizeSpeechFromBase64 } from "@/services/azureSpeechService";
import { MSG28 } from "@/constants/messages";
import { USE_MOCK, MOCK_WELCOME, MOCK_QUESTIONS } from "@/mocks/interviewMockData";

import voiceOnVideo from "@/assets/video/voiceOn.mp4";
import voiceOffVideo from "@/assets/video/voiceOff.mp4";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  responseId?: number;
  audioBase64?: string | null;
  mimeType?: string | null;
}

interface AudioQueueItem {
  audioBase64: string;
  mimeType?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function InterviewChat() {
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>();
  const sessionId = parseInt(sessionIdParam ?? "0");
  const navigate = useNavigate();

  // Chat state — khôi phục từ localStorage nếu có (persist qua tab close)
  const storageKey = `interview-chat-${sessionId}`;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [inputText, setInputText] = useState("");
  const [currentResponseId, setCurrentResponseId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-responseId`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [questionCount, setQuestionCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-qCount`);
      return saved ? JSON.parse(saved) : 0;
    } catch { return 0; }
  });
  const [totalQuestions] = useState(10);
  const MAX_SESSION_SECONDS = 30 * 60; // 30 minutes
  const mockQuestionIndex = useRef(0);
  const initCalledRef = useRef(false);

  // Loading states
  const [initializing, setInitializing] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ending, setEnding] = useState(false);

  // Timer — khôi phục từ startTime đã lưu
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    try {
      const savedStart = localStorage.getItem(`${storageKey}-startTime`);
      if (savedStart) {
        const elapsed = Math.floor((Date.now() - parseInt(savedStart)) / 1000);
        return Math.max(0, elapsed);
      }
    } catch { /* ignore */ }
    return 0;
  });

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // End confirmation
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // ----------------------------------------------------------------
  //  VIDEO STATE
  //
  //  Nguyên tắc hoạt động:
  //  - Tại mọi thời điểm chỉ 1 video đang chạy, video kia ẩn & dừng.
  //  - Muốn switch: tắt loop video đang chạy → nó tự chạy hết lượt
  //    hiện tại → onEnded → ẩn video cũ, hiện + play video mới.
  //  - Cắt đúng tại điểm nối frame cuối/đầu → tuyệt đối không giật.
  //  - Khi có audio mới → pendingToOn; khi hết audio → pendingToOff.
  // ----------------------------------------------------------------
  const videoOnRef = useRef<HTMLVideoElement>(null);
  const videoOffRef = useRef<HTMLVideoElement>(null);

  const isOnRef = useRef(false);  // video đang hiện: false=Off, true=On
  const pendingToOnRef = useRef(false);  // chờ voiceOff hết lượt để switch → On
  const pendingToOffRef = useRef(false);  // chờ voiceOn  hết lượt để switch → Off

  const [showingOn, setShowingOn] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Audio queue
  const audioQueueRef = useRef<AudioQueueItem[]>([]);
  const isProcessingQueueRef = useRef(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Dùng ref để startPlayingAudio có thể tự gọi lại mà không bị stale closure
  const startPlayingAudioRef = useRef<() => void>(() => { });

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-end when time limit reached
  useEffect(() => {
    if (elapsedSeconds >= MAX_SESSION_SECONDS && !ending && !initializing) {
      const autoEnd = async () => {
        toast.warning("Hết thời gian 30 phút! Buổi phỏng vấn sẽ tự động kết thúc.");
        await handleEndInterview();
      };
      autoEnd();
    }
  }, [elapsedSeconds, ending, initializing]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ----------------------------------------------------------------
  //  AUDIO QUEUE PROCESSING
  // ----------------------------------------------------------------
  const startPlayingAudio = useCallback(() => {
    if (isProcessingQueueRef.current) return;

    if (audioQueueRef.current.length === 0) {
      // Hết audio → request switch về voiceOff sau khi voiceOn chạy hết lượt
      const vidOn = videoOnRef.current;
      if (vidOn && isOnRef.current && !pendingToOffRef.current) {
        pendingToOffRef.current = true;
        vidOn.loop = false; // chạy hết lượt → onEnded tự switch
      }
      setIsPlayingAudio(false);
      return;
    }

    isProcessingQueueRef.current = true;
    setIsPlayingAudio(true);

    const item = audioQueueRef.current.shift()!;
    const mime = item.mimeType || "audio/wav";
    const audio = new Audio(`data:${mime};base64,${item.audioBase64}`);
    audioElRef.current = audio;

    const onDone = () => {
      audioElRef.current = null;
      isProcessingQueueRef.current = false;
      startPlayingAudioRef.current(); // gọi lại để phát item tiếp theo
    };

    audio.onended = onDone;
    audio.onerror = onDone;
    audio.play().catch(onDone);
  }, []);

  // Giữ ref luôn trỏ đến callback mới nhất
  useEffect(() => {
    startPlayingAudioRef.current = startPlayingAudio;
  }, [startPlayingAudio]);

  // ----------------------------------------------------------------
  //  Initialize video + gắn onEnded handlers
  // ----------------------------------------------------------------
  useEffect(() => {
    const vidOn = videoOnRef.current;
    const vidOff = videoOffRef.current;
    if (!vidOn || !vidOff) return;

    vidOn.src = voiceOnVideo;
    vidOff.src = voiceOffVideo;

    // voiceOff onEnded: kiểm tra có cần switch sang voiceOn không
    vidOff.onended = () => {
      if (pendingToOnRef.current) {
        pendingToOnRef.current = false;
        isOnRef.current = true;
        setShowingOn(true);
        vidOn.currentTime = 0;
        vidOn.loop = true;
        vidOn.play().catch(() => { });
        // Video On đã hiện → bắt đầu phát audio
        startPlayingAudioRef.current();
      } else {
        // Không cần switch → loop lại voiceOff
        vidOff.play().catch(() => { });
      }
    };

    // voiceOn onEnded: kiểm tra có cần switch về voiceOff không
    vidOn.onended = () => {
      if (pendingToOffRef.current) {
        pendingToOffRef.current = false;
        isOnRef.current = false;
        setShowingOn(false);
        vidOff.currentTime = 0;
        vidOff.loop = true;
        vidOff.play().catch(() => { });
      } else {
        // Không cần switch → loop lại voiceOn
        vidOn.play().catch(() => { });
      }
    };

    // Bắt đầu với voiceOff loop, preload voiceOn sẵn
    vidOff.loop = true;
    vidOff.play().catch(() => { });
    vidOn.preload = "auto";
    vidOn.load();

    return () => {
      vidOff.onended = null;
      vidOn.onended = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------------------------------------------------------
  //  Enqueue audio
  // ----------------------------------------------------------------
  const enqueueAudio = useCallback(
    (audioBase64: string, mimeType?: string | null) => {
      audioQueueRef.current.push({ audioBase64, mimeType });

      if (!isOnRef.current && !pendingToOnRef.current) {
        // Đang ở voiceOff, chưa có pending → tắt loop, chờ hết lượt rồi switch
        const vidOff = videoOffRef.current;
        if (vidOff) {
          pendingToOnRef.current = true;
          vidOff.loop = false;
        }
        // Audio sẽ được phát bởi onEnded của voiceOff sau khi switch xong
      } else if (pendingToOffRef.current) {
        // Đang chờ về Off nhưng có audio mới → huỷ pending, voiceOn tiếp tục loop
        pendingToOffRef.current = false;
        const vidOn = videoOnRef.current;
        if (vidOn) {
          vidOn.loop = true;
          if (!isProcessingQueueRef.current) startPlayingAudio();
        }
      } else if (isOnRef.current && !isProcessingQueueRef.current) {
        // Đang ở voiceOn, không có gì phát → phát ngay
        startPlayingAudio();
      }
      // Nếu pendingToOn đang chờ → audio nằm trong queue, onEnded sẽ gọi startPlayingAudio
    },
    [startPlayingAudio]
  );

  // ----------------------------------------------------------------
  //  Stop all audio + reset video về voiceOff
  // ----------------------------------------------------------------
  const stopAllAudio = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    audioQueueRef.current = [];
    isProcessingQueueRef.current = false;
    pendingToOnRef.current = false;
    pendingToOffRef.current = false;

    const vidOn = videoOnRef.current;
    const vidOff = videoOffRef.current;
    if (vidOn) { vidOn.pause(); vidOn.loop = false; }
    if (vidOff) { vidOff.loop = true; vidOff.play().catch(() => { }); }

    isOnRef.current = false;
    setShowingOn(false);
    setIsPlayingAudio(false);
  }, []);

  // ----------------------------------------------------------------
  //  Add message helper
  // ----------------------------------------------------------------
  const addMessage = useCallback(
    (
      role: "ai" | "user",
      text: string,
      responseId?: number,
      audioBase64?: string | null,
      mimeType?: string | null
    ) => {
      const msgId = `${Date.now()}-${Math.random()}`;
      setMessages((prev) => [
        ...prev,
        { id: msgId, role, text, responseId, audioBase64, mimeType },
      ]);
      if (role === "ai" && audioBase64) {
        enqueueAudio(audioBase64, mimeType);
      }
    },
    [enqueueAudio]
  );

  // Lưu messages vào localStorage (persist qua tab close)
  useEffect(() => {
    try {
      const toSave = messages.map(({ audioBase64, ...rest }) => rest);
      localStorage.setItem(storageKey, JSON.stringify(toSave));
      localStorage.setItem(`${storageKey}-responseId`, JSON.stringify(currentResponseId));
      localStorage.setItem(`${storageKey}-qCount`, JSON.stringify(questionCount));
    } catch { /* quota exceeded */ }
  }, [messages, currentResponseId, questionCount, storageKey]);

  // Lưu startTime khi bắt đầu phỏng vấn (chỉ lưu 1 lần)
  useEffect(() => {
    const key = `${storageKey}-startTime`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, Date.now().toString());
    }
  }, [storageKey]);

  // ----------------------------------------------------------------
  //  Fetch next question
  // ----------------------------------------------------------------
  const fetchNextQuestion = useCallback(async () => {
    try {
      setGenerating(true);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
        const idx = mockQuestionIndex.current;
        if (idx >= MOCK_QUESTIONS.length) {
          addMessage("ai", "Buổi phỏng vấn đã kết thúc. Cảm ơn bạn đã tham gia! Đang chuyển đến trang kết quả...");
          setTimeout(() => { stopAllAudio(); navigate(`/interview-history/${sessionId}`); }, 3000);
          return;
        }
        const q = MOCK_QUESTIONS[idx];
        mockQuestionIndex.current = idx + 1;
        setQuestionCount((c) => c + 1);
        setCurrentResponseId(q.interviewResponseId);
        addMessage("ai", q.questionText, q.interviewResponseId);
        return;
      }

      const q: GenerateQuestionResponse = await generateQuestion(sessionId);

      if (q.isTerminated) {
        addMessage("ai", q.terminationMessage || "Buổi phỏng vấn đã kết thúc. Cảm ơn bạn!", undefined, q.audioBase64, q.mimeType);
        try { await endInterview(sessionId); } catch { /* ignore */ }
        setTimeout(() => { stopAllAudio(); navigate(`/interview-history/${sessionId}`); }, 3000);
        return;
      }

      setQuestionCount((c) => c + 1);
      setCurrentResponseId(q.interviewResponseId);
      addMessage("ai", q.questionText, q.interviewResponseId, q.audioBase64, q.mimeType);
    } catch {
      toast.error(MSG28);
      try { await endInterview(sessionId); } catch { /* ignore */ }
      setTimeout(() => { stopAllAudio(); navigate(`/interview-history/${sessionId}`); }, 3000);
    } finally {
      setGenerating(false);
    }
  }, [sessionId, addMessage, navigate, stopAllAudio]);

  // ----------------------------------------------------------------
  //  Initialize interview
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!sessionId) return;
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const hasCache = messages.length > 0;
    if (hasCache) {
      setInitializing(false);
      return;
    }

    const init = async () => {
      try {
        setInitializing(true);
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 800));
          addMessage("ai", MOCK_WELCOME);
          await fetchNextQuestion();
          return;
        }
        const welcomeData: WelcomeMessageResponse = await getWelcomeMessage(sessionId);
        addMessage("ai", welcomeData.welcomeMessage, undefined, welcomeData.audioBase64, welcomeData.mimeType);
        await fetchNextQuestion();
      } catch {
        toast.error("Phiên phỏng vấn không hợp lệ hoặc đã kết thúc.");
        navigate("/practice-with-ai");
      } finally {
        setInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ----------------------------------------------------------------
  //  Send answer
  // ----------------------------------------------------------------
  const handleSendAnswer = async () => {
    const answer = inputText.trim();
    if (!answer || sending) return;

    if (currentResponseId == null) {
      toast.error("Hệ thống chưa nhận được ID câu hỏi từ AI. Vui lòng thử lại!");
      console.error("Missing currentResponseId. Check API generateQuestion response.");
      return;
    }

    try {
      setSending(true);
      addMessage("user", answer);
      setInputText("");

      let aiReaction: string | undefined;
      let aiReactionAudioBase64: string | null | undefined;
      let reactionMimeType: string | null | undefined;

      if (!USE_MOCK) {
        const result = await submitAnswer({
          interviewSessionId: sessionId,
          interviewResponseId: currentResponseId,
          userAnswer: answer,
        });
        aiReaction = result.aiReaction;
        aiReactionAudioBase64 = result.aiReactionAudioBase64;
        reactionMimeType = result.mimeType;
      } else {
        await new Promise((r) => setTimeout(r, 300));
        aiReaction = "Cảm ơn câu trả lời! Để tôi hỏi tiếp nhé.";
      }

      if (aiReaction) {
        addMessage("ai", aiReaction, undefined, aiReactionAudioBase64, reactionMimeType);
        await new Promise((r) => setTimeout(r, 800));
      }

      await fetchNextQuestion();
    } catch {
      toast.error("Không gửi được câu trả lời. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // ----------------------------------------------------------------
  //  Voice recording — Azure STT
  // ----------------------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        try {
          setIsTranscribing(true);
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
          });

          let transcript = await recognizeSpeechFromBase64({
            audioData: base64,
            language: "vi-VN",
          });

          try {
            transcript = await correctTranscript(transcript);
          } catch { /* dùng raw nếu lỗi */ }

          setInputText((prev) => prev ? `${prev} ${transcript}` : transcript);
        } catch {
          toast.error("Không thể nhận dạng giọng nói. Vui lòng thử lại.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Không thể truy cập microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ----------------------------------------------------------------
  //  End interview
  // ----------------------------------------------------------------
  // Xóa localStorage khi phỏng vấn kết thúc
  const clearInterviewStorage = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}-responseId`);
    localStorage.removeItem(`${storageKey}-qCount`);
    localStorage.removeItem(`${storageKey}-startTime`);
  }, [storageKey]);

  const handleEndInterview = async () => {
    try {
      setEnding(true);
      setShowEndConfirm(false);
      if (!USE_MOCK) await endInterview(sessionId);
      else await new Promise((r) => setTimeout(r, 500));
      clearInterviewStorage();
      toast.success("Buổi phỏng vấn đã kết thúc. Đang chuyển sang trang kết quả...");
      setTimeout(() => { stopAllAudio(); navigate(`/interview-history/${sessionId}`); }, 2000);
    } catch {
      toast.error("Không thể kết thúc phỏng vấn. Vui lòng thử lại.");
      setEnding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  const isBusy = sending || generating || ending || initializing;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex h-screen flex-col bg-[#0a0b1a]">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between border-b border-slate-800/60 bg-[#0d0e21] px-6 py-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/60 px-4 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu hỏi</span>
          <span className="text-sm font-bold text-purple-400">{questionCount}/{totalQuestions}</span>
        </div>

        <div className="text-center">
          <h1 className="text-sm font-bold uppercase tracking-widest text-white">Luyện tập thử với AI</h1>
          <p className="mt-0.5 text-xs text-purple-400">⏱ {formatTime(elapsedSeconds)}</p>
        </div>

        <button
          onClick={() => setShowEndConfirm(true)}
          disabled={ending}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          {ending ? "Đang kết thúc..." : "Kết thúc"}
        </button>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ===== LEFT: VIDEO PANEL ===== */}
        <div className="relative flex w-3/5 flex-col items-center justify-center border-r border-slate-800/40 bg-[#080918] px-4 pt-4 pb-10 order-2">
          {/*
           * Switch video tại điểm nối frame (onEnded) — hoàn toàn không giật.
           * Chỉ 1 video chạy tại mỗi thời điểm, video kia dừng và ẩn.
           * Không dùng CSS transition để tránh tạo khoảng mờ giữa 2 video.
           */}
          <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl shadow-purple-900/20">
            {/* voiceOff — hiển thị mặc định */}
            <video
              ref={videoOffRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              style={{
                position: "absolute",
                inset: 0,
                opacity: showingOn ? 0 : 1,
              }}
            />

            {/* voiceOn — hiển thị khi đang nói */}
            <video
              ref={videoOnRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              style={{
                opacity: showingOn ? 1 : 0,
              }}
            />

            {/* Status badge */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm transition-all z-10 ${isPlayingAudio ? "bg-purple-600/80 opacity-100" : "bg-slate-800/60 opacity-60"
              }`}>
              {isPlayingAudio ? (
                <>
                  <div className="flex items-end gap-[3px] h-4">
                    {[1, 2, 3, 4, 3].map((h, i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-white animate-bounce"
                        style={{ height: `${h * 4}px`, animationDelay: `${i * 80}ms`, animationDuration: "600ms" }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-white">Đang nói...</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs font-semibold text-slate-300">Đang lắng nghe</span>
                </>
              )}
            </div>

            {/* imAI Info - Overlay on video, top right corner */}
            <div className="absolute top-4 right-4 text-right z-20 bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3">
              <h3 className="text-lg font-bold text-white">imAI</h3>
              <p className="text-xs text-slate-300">Nhà tuyển dụng IMATE</p>
              <p className="text-xs text-slate-400">AI Interviewer</p>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: CHAT PANEL ===== */}
        <div className="flex w-2/5 flex-col order-1 border-l border-slate-800/40">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {initializing && (
                <div className="flex items-center gap-3 text-purple-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Đang khởi tạo buổi phỏng vấn...</span>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "ai" && (
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600/20">
                      <Bot className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "ai"
                    ? "rounded-tl-md bg-slate-800/80 text-slate-200"
                    : "rounded-tr-md bg-purple-600/20 text-white"
                    }`}>
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {generating && (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600/20">
                    <Bot className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-slate-800/80 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="border-t border-slate-800/60 bg-[#0d0e21]/80 px-4 py-3">
            <div className="flex items-end gap-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isBusy || isTranscribing}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${isRecording
                  ? "animate-pulse bg-red-500 text-white"
                  : isTranscribing
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                  } disabled:opacity-50`}
                title={isRecording ? "Dừng ghi âm" : isTranscribing ? "Đang chuyển giọng nói..." : "Ghi âm giọng nói"}
              >
                {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu trả lời của bạn..."
                  rows={1}
                  disabled={isBusy}
                  className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500/50 disabled:opacity-50"
                  style={{ maxHeight: "100px", height: "auto", minHeight: "40px" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 100) + "px";
                  }}
                />
                <span className="absolute bottom-2 right-2 text-[9px] text-slate-600">Shift+Enter</span>
              </div>

              <button
                onClick={handleSendAnswer}
                disabled={!inputText.trim() || isBusy}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition-all hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* ===== END CONFIRM MODAL ===== */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-800 p-6 shadow-2xl">
            <h3 className="mb-3 text-lg font-bold text-white">Kết thúc phỏng vấn?</h3>
            <p className="mb-6 text-sm text-slate-400">
              Bạn có chắc chắn muốn kết thúc buổi phỏng vấn sớm? AI sẽ tạo báo cáo phản hồi dựa trên các câu hỏi bạn đã trả lời.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                Tiếp tục phỏng vấn
              </button>
              <button
                onClick={handleEndInterview}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400"
              >
                Kết thúc ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
