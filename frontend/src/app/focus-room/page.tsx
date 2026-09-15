'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Video, PhoneOff, Users, Check, Mic, MicOff, Camera, VideoOff,
  Search, Settings, Home, Bell, MessageSquare, BarChart2,
  Volume2, Pause, Captions, Maximize2, Share2, ChevronDown, Sparkles
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { checkInCoStudy } from '@/lib/coStudyStreak';
import { supabase } from '@/lib/supabase';
import FriendChatPanel from '@/components/shared/FriendChatPanel';

const JitsiCallRoom = dynamic(() => import('@/components/shared/JitsiCallRoom'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[300px] bg-slate-900/60 rounded-3xl">
      <div className="text-center">
        <div
          className="w-10 h-10 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderWidth: 3, borderStyle: 'solid' }}
        />
        <p className="text-white/80 text-sm font-medium">Đang kết nối camera phòng học...</p>
        <p className="text-white/40 text-xs mt-1">Vui lòng cho phép truy cập Camera & Mic</p>
      </div>
    </div>
  )
});

/* ─── Lobby Screen (Khi chưa vào phòng) ─────────────────────────── */
function LobbyScreen({
  inputRoomID,
  setInputRoomID,
  onCreateRoom,
  onJoinRoom,
}: {
  inputRoomID: string;
  setInputRoomID: (v: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-lg border border-white/80">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 12px 30px rgba(79, 70, 229, 0.35)',
            }}
          >
            <Video size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Phòng Học Nhóm</h2>
          <p className="text-gray-500 text-xs">Video call HD, trò chuyện cùng bạn bè và giữ chuỗi học tập</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onCreateRoom}
            className="w-full py-3.5 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:opacity-95 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #3754b8 0%, #1c3685 100%)',
            }}
          >
            <Video size={17} />
            Tạo phòng học mới
          </button>

          <div className="relative flex items-center my-2">
            <div className="flex-1 border-t border-gray-200" />
            <span className="mx-3 text-[11px] text-gray-400 font-medium">hoặc tham gia phòng</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputRoomID}
              onChange={(e) => setInputRoomID(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onJoinRoom()}
              placeholder="Nhập mã phòng (vd: study-abc)..."
              className="flex-1 px-4 py-3 bg-[#f3f6fc] border border-gray-200/80 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            <button
              onClick={onJoinRoom}
              disabled={!inputRoomID.trim()}
              className="px-5 py-3 bg-[#1b357d] text-white font-bold text-xs rounded-2xl hover:bg-[#162b66] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Vào
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── In-Room Screen (Giao diện chuẩn theo ảnh mẫu) ─────────────── */
function RoomLayout({
  roomID,
  userName,
  userEmail,
  friendName,
  onLeave,
  onCopyLink,
  copied,
}: {
  roomID: string;
  userName: string;
  userEmail?: string;
  friendName?: string | null;
  onLeave: () => void;
  onCopyLink: () => void;
  copied: boolean;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [volume, setVolume] = useState(70);
  const [participantCount, setParticipantCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const roomTitle = friendName
    ? `Học cùng ${friendName}`
    : `Phòng học trực tuyến • ${roomID}`;

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full bg-[#ebf1fb] text-[#1c2942] p-2.5 sm:p-4 gap-3 select-none overflow-hidden font-sans"
    >
      {/* ── 2. Khu vực Chính (Center: Top Header + Video Area) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 px-1 gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#142345] truncate tracking-tight">
              {roomTitle}
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-semibold text-gray-600 shadow-2xs border border-gray-100 flex-shrink-0">
              <Users size={13} className="text-[#3b5cb8]" />
              <span>{participantCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-gray-100 shadow-2xs w-44 md:w-56 focus-within:ring-2 focus-within:ring-indigo-300 transition-all">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-gray-800 outline-none w-full placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md pl-1 pr-2 py-1 rounded-full shadow-2xs border border-gray-100 cursor-pointer hover:bg-white transition-colors">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                alt={userName}
                className="w-7 h-7 rounded-full object-cover bg-indigo-50"
              />
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Video Screen Box */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="relative flex-1 rounded-[2rem] overflow-hidden bg-[#10131e] shadow-md border border-white/60">
            <div className="w-full h-full">
              <JitsiCallRoom
                roomID={roomID}
                userName={userName}
                userEmail={userEmail}
                onLeave={onLeave}
              />
            </div>

            {/* Floating Badge: "You" */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3.5 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-white text-xs font-semibold shadow-xs border border-white/10">
                You
              </div>
            </div>

            {/* Floating Badge: REC Timer */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-white text-xs font-bold shadow-xs border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono">{formatTimer(elapsed)}</span>
              </div>
            </div>

            {/* Real Status Note */}
            {showSubtitles && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 max-w-[85%] w-auto pointer-events-none">
                <div className="px-5 py-2.5 bg-black/50 backdrop-blur-lg rounded-2xl text-white/95 text-xs sm:text-sm font-normal text-center shadow-lg border border-white/10 truncate">
                  {friendName ? `Đang trong buổi học cùng ${friendName}` : `Đang kết nối phòng học trực tuyến • ID: ${roomID}`}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Floating Control Bar ── */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xs border border-white/90 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 w-36 sm:w-44">
              <Volume2 size={16} className="text-gray-500 flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1b357d]"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl transition-all ${
                  isMuted
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-[#f4f7fc] text-gray-700 hover:bg-gray-100 border border-gray-200/50'
                }`}
                title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
              >
                {isMuted ? <MicOff size={17} /> : <Mic size={17} />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2.5 rounded-xl transition-all ${
                  isVideoOff
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-[#e2eafc] text-[#1b357d] border border-blue-200/60 shadow-2xs'
                }`}
                title={isVideoOff ? 'Bật Camera' : 'Tắt Camera'}
              >
                {isVideoOff ? <VideoOff size={17} /> : <Camera size={17} />}
              </button>

              <button
                className="p-2.5 rounded-xl bg-[#f4f7fc] text-gray-700 hover:bg-gray-100 border border-gray-200/50 transition-all"
                title="Tạm dừng"
              >
                <Pause size={17} />
              </button>

              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-2.5 rounded-xl transition-all ${
                  showSubtitles
                    ? 'bg-[#1b357d] text-white shadow-xs'
                    : 'bg-[#f4f7fc] text-gray-700 hover:bg-gray-100 border border-gray-200/50'
                }`}
                title="Bật/Tắt ghi chú"
              >
                <Captions size={17} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-[#f4f7fc] text-gray-700 hover:bg-gray-100 border border-gray-200/50 transition-all"
                title="Toàn màn hình"
              >
                <Maximize2 size={17} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCopyLink}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f7fc] hover:bg-gray-100 text-[#1b357d] text-xs font-semibold rounded-xl transition-colors border border-gray-200/50"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
                <span>{copied ? 'Đã copy' : 'Chia sẻ'}</span>
              </button>

              <button
                onClick={onLeave}
                className="sm:hidden p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Rời phòng"
              >
                <PhoneOff size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Cột Chat Panel bên phải (Data thật 100%) ── */}
      <div className="w-80 flex-shrink-0 hidden lg:flex flex-col h-full">
        <FriendChatPanel
          roomID={roomID}
          onParticipantCountChange={(count) => setParticipantCount(count)}
        />
      </div>
    </div>
  );
}

/* ─── Main Focus Room Page ─────────────────────────────────────── */
function FocusRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [inRoom, setInRoom] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [inputRoomID, setInputRoomID] = useState('');
  const [copied, setCopied] = useState(false);
  const [friendName, setFriendName] = useState<string | null>(null);

  useEffect(() => {
    const friendId = searchParams.get('friendId');
    if (friendId) {
      supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', friendId)
        .single()
        .then(({ data }) => {
          if (data) {
            setFriendName(data.full_name || data.email?.split('@')[0] || null);
          }
        });
    }
  }, [searchParams]);

  useEffect(() => {
    const urlRoomID = searchParams.get('roomID');
    if (urlRoomID && user) {
      setRoomID(urlRoomID);
      setInRoom(true);

      const isSharedRoom = urlRoomID.startsWith('study-') && urlRoomID.length > 10;
      if (isSharedRoom) {
        const timer = setTimeout(() => {
          const friendId = searchParams.get('friendId');
          if (friendId && user.id) {
            checkInCoStudy(user.id, friendId, urlRoomID);
          }
        }, 2 * 60 * 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, user]);

  const createRoom = () => {
    const newRoomID = `study-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRoomID(newRoomID);
    setInRoom(true);
    window.history.pushState({}, '', `/focus-room?roomID=${newRoomID}`);
  };

  const joinRoom = () => {
    if (!inputRoomID.trim()) return;
    const id = inputRoomID.trim();
    setRoomID(id);
    setInRoom(true);
    window.history.pushState({}, '', `/focus-room?roomID=${id}`);
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/focus-room?roomID=${roomID}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = () => {
    setInRoom(false);
    setRoomID('');
    router.push('/focus-room');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#ebf1fb]">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-600 text-sm font-medium">Bạn cần đăng nhập để vào phòng học trực tuyến.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#ebf1fb]">
      {!inRoom ? (
        <LobbyScreen
          inputRoomID={inputRoomID}
          setInputRoomID={setInputRoomID}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
        />
      ) : (
        <RoomLayout
          roomID={roomID}
          userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'Học sinh'}
          userEmail={user.email}
          friendName={friendName}
          onLeave={leaveRoom}
          onCopyLink={copyLink}
          copied={copied}
        />
      )}
    </div>
  );
}

export default function FocusRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] bg-[#ebf1fb]">
          <div
            className="w-9 h-9 border-indigo-500 border-t-transparent rounded-full animate-spin"
            style={{ borderWidth: 3, borderStyle: 'solid' }}
          />
        </div>
      }
    >
      <FocusRoomContent />
    </Suspense>
  );
}
