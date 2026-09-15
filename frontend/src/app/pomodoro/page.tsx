'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Plus,
  Flame,
  Sparkles,
  X,
  Check,
  Sliders,
  Image as ImageIcon,
  PlayCircle as Youtube,
  Link as LinkIcon,
  MonitorPlay,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePomodoro } from '@/context/PomodoroContext';
import { getStreakState, subscribeStreak, StreakState } from '@/lib/studyStreak';
import { FocusPetPanel, PetId } from '@/components/pomodoro/FocusPet';
import { BreakBankPanel } from '@/components/pomodoro/BreakBankPanel';

/* ─── Static wallpapers ─────────────────────────────────────────── */
const WALLPAPERS = [
  { id: 'ghibli_hill', name: 'Đồi cỏ Ghibli', src: '/images/ghibli_hill_bg.jpg' },
  { id: 'rainy_cafe', name: 'Quán Cafe Mưa', src: '/images/rainy_cafe_bg.jpg' },
  { id: 'night_campfire', name: 'Lửa trại Đêm', src: '/images/night_campfire_bg.jpg' },
  { id: 'shinchan', name: 'Phòng Shinchan', src: '/images/shinchan_bg.jpg' },
];

/* ─── Curated YouTube study/lofi backgrounds ─────────────────────── */
const YOUTUBE_VIDEOS = [
  {
    id: 'jfKfPfyJRdk',
    name: 'Lofi Girl ☕',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
  },
  {
    id: '4xDzrJKXOOY',
    name: 'Synthwave Radio 🌃',
    thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/mqdefault.jpg',
  },
  {
    id: 'rUxyKA_-grg',
    name: 'Coffee Shop ☔',
    thumbnail: 'https://img.youtube.com/vi/rUxyKA_-grg/mqdefault.jpg',
  },
  {
    id: '5qap5aO4i9A',
    name: 'Chillhop Radio 🐾',
    thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg',
  },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
/** Parse a YouTube URL / youtu.be / video ID → video ID or null */
function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Plain 11-char video ID (e.g. "jfKfPfyJRdk")
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    // youtube.com/watch?v=…
    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v') || null;
    }
    // youtu.be/…
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1) || null;
    }
    // youtube.com/embed/…
    if (url.pathname.startsWith('/embed/')) {
      return url.pathname.split('/embed/')[1]?.split(/[?/]/)[0] || null;
    }
    // youtube.com/live/…
    if (url.pathname.startsWith('/live/')) {
      return url.pathname.split('/live/')[1]?.split(/[?/]/)[0] || null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

type BgMode = 'image' | 'video';

const LOFI_TRACKS = [
  {
    title: 'Your Eyes',
    artist: 'Joey Pecoraro',
    album: 'lofi ☕ for study, chill, and more',
    sound: 'rain' as const,
  },
  {
    title: 'Coffee Beans & Rain',
    artist: 'ChillHop Studio',
    album: 'lofi ☕ for study, chill, and more',
    sound: 'rain' as const,
  },
  {
    title: 'Ocean Breeze & Sunset',
    artist: 'Study Vibes',
    album: 'lofi ☕ for study, chill, and more',
    sound: 'waves' as const,
  },
];

export default function PomodoroPage() {
  const {
    mode,
    timeLeft,
    isRunning,
    customMinutes,
    setIsRunning,
    switchMode,
    resetTimer,
    setCustomMinutes,
    setAmbientSound,
    formatTime,
    dailyCompletedSessions,
    dailyFocusMinutes,
  } = usePomodoro();

  /* ─── Background state ─────────────────────────────────────────── */
  const [bgMode, setBgMode] = useState<BgMode>('image');
  const [currentBg, setCurrentBg] = useState('/images/ghibli_hill_bg.jpg');
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);
  const [ytInput, setYtInput] = useState('');
  const [ytError, setYtError] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);

  // Streak & Pet states
  const [streakState, setStreakState] = useState<StreakState>(getStreakState());
  const [currentPetId, setCurrentPetId] = useState<PetId>('cat');
  const [petStats, setPetStats] = useState<Record<string, number>>({});
  const [is3DMode, setIs3DMode] = useState<boolean>(true);

  // Settings form
  const [tempMinutes, setTempMinutes] = useState(customMinutes);
  // Settings-modal-local bg state (so we can "preview" before saving)
  const [settingsBgMode, setSettingsBgMode] = useState<BgMode>('image');
  const [settingsYtId, setSettingsYtId] = useState<string | null>(null);
  const [settingsBg, setSettingsBg] = useState('/images/ghibli_hill_bg.jpg');

  const containerRef = useRef<HTMLDivElement>(null);
  const ytIframeRef = useRef<HTMLIFrameElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  /* ─── Init: restore saved prefs ────────────────────────────────── */
  useEffect(() => {
    setStreakState(getStreakState());
    const unsub = subscribeStreak(() => {
      setStreakState(getStreakState());
    });

    const savedBg = localStorage.getItem('pomodoro_wallpaper');
    if (savedBg) setCurrentBg(savedBg);

    const savedMode = localStorage.getItem('pomodoro_bg_mode') as BgMode | null;
    if (savedMode) setBgMode(savedMode);

    const savedYt = localStorage.getItem('pomodoro_yt_video');
    if (savedYt) setYtVideoId(savedYt);

    const savedPet = localStorage.getItem('pomodoro_focus_pet') as PetId;
    if (savedPet) setCurrentPetId(savedPet);

    return () => unsub();
  }, []);

  useEffect(() => {
    setTempMinutes(customMinutes);
  }, [customMinutes]);

  // Music progress simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingMusic) {
      interval = setInterval(() => {
        setMusicProgress((p) => (p >= 180 ? 0 : p + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingMusic]);

  // Sync settings modal state when opening
  useEffect(() => {
    if (showSettings) {
      setSettingsBgMode(bgMode);
      setSettingsYtId(ytVideoId);
      setSettingsBg(currentBg);
      setYtInput('');
      setYtError('');
    }
  }, [showSettings]);

  const toggleMusic = () => {
    if (isPlayingMusic) {
      setIsPlayingMusic(false);
      setAmbientSound('none');
    } else {
      setIsPlayingMusic(true);
      const track = LOFI_TRACKS[currentTrackIndex];
      setAmbientSound(track.sound);
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % LOFI_TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    if (isPlayingMusic) {
      setAmbientSound(LOFI_TRACKS[nextIdx].sound);
    }
  };

  const prevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + LOFI_TRACKS.length) % LOFI_TRACKS.length;
    setCurrentTrackIndex(prevIdx);
    if (isPlayingMusic) {
      setAmbientSound(LOFI_TRACKS[prevIdx].sound);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const toggleVideoPlay = () => {
    const next = !isVideoPlaying;
    setIsVideoPlaying(next);
    if (ytIframeRef.current?.contentWindow) {
      const cmd = next ? 'playVideo' : 'pauseVideo';
      ytIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: cmd, args: '' }),
        '*'
      );
    }
  };

  const toggleVideoMute = () => {
    const next = !isVideoMuted;
    setIsVideoMuted(next);
    if (ytIframeRef.current?.contentWindow) {
      const cmd = next ? 'mute' : 'unMute';
      ytIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: cmd, args: '' }),
        '*'
      );
    }
  };

  const handleSaveSettings = () => {
    setCustomMinutes(tempMinutes);

    // Apply background changes
    setBgMode(settingsBgMode);
    setCurrentBg(settingsBg);
    setYtVideoId(settingsYtId);

    localStorage.setItem('pomodoro_bg_mode', settingsBgMode);
    localStorage.setItem('pomodoro_wallpaper', settingsBg);
    if (settingsYtId) {
      localStorage.setItem('pomodoro_yt_video', settingsYtId);
    } else {
      localStorage.removeItem('pomodoro_yt_video');
    }

    setShowSettings(false);
    resetTimer();
  };

  const handleSelectWallpaper = (src: string) => {
    setSettingsBg(src);
    setSettingsBgMode('image');
  };

  const handleSelectYtVideo = (videoId: string) => {
    setSettingsYtId(videoId);
    setSettingsBgMode('video');
    setYtError('');
  };

  const handleYtInputSubmit = useCallback(() => {
    const vid = extractYouTubeId(ytInput);
    if (vid) {
      handleSelectYtVideo(vid);
      setYtInput('');
      setYtError('');
    } else {
      setYtError('Link không hợp lệ. Hãy dán URL YouTube hoặc ID video.');
    }
  }, [ytInput]);

  const handleClearVideo = () => {
    setSettingsYtId(null);
    setSettingsBgMode('image');
  };

  const formatMusicTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + String(s).padStart(2, '0');
  };


  /* ─── Is video mode active? ────────────────────────────────────── */
  const isVideoActive = bgMode === 'video' && !!ytVideoId;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-cover bg-center font-sans transition-all duration-700 flex flex-col justify-between"
      style={{
        backgroundImage: isVideoActive ? 'none' : 'url(' + currentBg + ')',
        backgroundColor: isVideoActive ? '#0f0f0f' : undefined,
      }}
    >
      {/* ── YouTube video background iframe ── */}
      {isVideoActive && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <iframe
            ref={ytIframeRef}
            src={`https://www.youtube.com/embed/${ytVideoId}?enablejsapi=1&autoplay=1&mute=${isVideoMuted ? 1 : 0}&loop=1&playlist=${ytVideoId}&controls=0&showinfo=0&modestbranding=1&rel=0&fs=0&iv_load_policy=3&disablekb=1&playsinline=1`}
            title="YouTube background"
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-none transition-opacity duration-500"
            style={{
              width: '100vw',
              height: '56.25vw',
              minWidth: '177.77vh',
              minHeight: '100vh',
              opacity: isVideoPlaying ? 1 : 0.4,
            }}
          />
        </div>
      )}

      {/* Dark overlay without continuous backdrop-blur to prevent GPU video decoding lag */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-[1]" />

      {/* ── 1. Top Bar: Utility Controls ── */}
      <div className="relative z-10 flex items-center justify-between p-6 sm:p-8">
        {/* Left: Video status & controls when active */}
        <div>
          {isVideoActive && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/80 backdrop-blur-md rounded-full text-white text-xs font-bold shadow-lg border border-white/15 animate-in fade-in">
                <Youtube size={14} />
                <span>{isVideoPlaying ? 'YouTube Live' : 'Đã tạm dừng'}</span>
                {isVideoPlaying && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </div>

              <button
                onClick={toggleVideoPlay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xs"
                title={isVideoPlaying ? 'Tạm dừng video nền' : 'Tiếp tục phát video nền'}
              >
                {isVideoPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isVideoPlaying ? 'Tạm dừng' : 'Phát video'}</span>
              </button>

              <button
                onClick={toggleVideoMute}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xs"
                title={isVideoMuted ? 'Bật âm thanh video' : 'Tắt âm thanh video'}
              >
                {isVideoMuted ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} />}
                <span>{isVideoMuted ? 'Tắt tiếng' : 'Âm thanh'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {streakState.streakCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white text-xs font-bold shadow-xs border border-white/20">
              <Flame size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
              <span>{streakState.streakCount} ngày</span>
            </div>
          )}

          <button
            onClick={() => setShowPetModal(!showPetModal)}
            className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-all border border-white/20 shadow-xs"
            title="Thú cưng tập trung & Break bank"
          >
            <Sparkles size={17} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-all border border-white/20 shadow-xs"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>

      {/* ── 2. Trung tâm: Tabs, Đồng hồ số to khổng lồ, Nút điều khiển ── */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => switchMode('focus')}
            className={
              'px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ' +
              (mode === 'focus'
                ? 'bg-white text-[#1b2b4f] shadow-md font-bold scale-105'
                : 'text-white border border-white/40 hover:bg-white/15 backdrop-blur-xs')
            }
          >
            pomodoro
          </button>

          <button
            onClick={() => switchMode('shortBreak')}
            className={
              'px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ' +
              (mode === 'shortBreak'
                ? 'bg-white text-[#1b2b4f] shadow-md font-bold scale-105'
                : 'text-white border border-white/40 hover:bg-white/15 backdrop-blur-xs')
            }
          >
            short break
          </button>

          <button
            onClick={() => switchMode('longBreak')}
            className={
              'px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ' +
              (mode === 'longBreak'
                ? 'bg-white text-[#1b2b4f] shadow-md font-bold scale-105'
                : 'text-white border border-white/40 hover:bg-white/15 backdrop-blur-xs')
            }
          >
            long break
          </button>
        </div>

        {/* Đồng hồ số to khổng lồ (25:00) */}
        <div className="my-2 sm:my-4">
          <span
            className="text-[6.5rem] sm:text-[9.5rem] md:text-[11rem] font-bold text-white tracking-tight leading-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none"
            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Hàng nút điều khiển: start/pause, reset, settings */}
        <div className="flex items-center gap-3.5 sm:gap-4 mt-2 sm:mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 sm:px-10 py-3 sm:py-3.5 bg-white hover:bg-white/95 text-[#1e293b] font-bold text-base sm:text-lg rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all tracking-wide"
          >
            {isRunning ? 'pause' : 'start'}
          </button>

          <button
            onClick={resetTimer}
            className="w-11 sm:w-12 h-11 sm:h-12 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur-xs transition-all active:scale-95 shadow-md"
            title="Đặt lại thời gian"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-11 sm:w-12 h-11 sm:h-12 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur-xs transition-all active:scale-95 shadow-md"
            title="Cài đặt Pomodoro & Hình nền"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>



      {/* ── 4. Modal Cài đặt Pomodoro & Hình nền & Video YouTube ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#1b2b4f]" />
                <h3 className="text-base font-bold text-gray-900">Cài đặt Pomodoro</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Timer settings */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Thời gian học (Pomodoro - phút)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={tempMinutes.focus}
                  onChange={(e) => setTempMinutes({ ...tempMinutes, focus: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Nghỉ ngắn (phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tempMinutes.shortBreak}
                    onChange={(e) => setTempMinutes({ ...tempMinutes, shortBreak: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Nghỉ dài (phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tempMinutes.longBreak}
                    onChange={(e) => setTempMinutes({ ...tempMinutes, longBreak: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ─── Background Mode Tabs ─── */}
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => { setSettingsBgMode('image'); }}
                  className={
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ' +
                    (settingsBgMode === 'image'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700')
                  }
                >
                  <ImageIcon size={14} />
                  Hình ảnh
                </button>
                <button
                  onClick={() => { setSettingsBgMode('video'); }}
                  className={
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ' +
                    (settingsBgMode === 'video'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700')
                  }
                >
                  <Youtube size={14} />
                  Video YouTube
                </button>
              </div>
            </div>

            {/* ─── Image Wallpaper Picker ─── */}
            {settingsBgMode === 'image' && (
              <div className="mb-6 animate-in fade-in slide-in-from-left-2 duration-200">
                <label className="text-xs font-semibold text-gray-700 block mb-2 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-indigo-600" />
                  Chọn hình nền phong cảnh
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {WALLPAPERS.map((wp) => (
                    <div
                      key={wp.id}
                      onClick={() => handleSelectWallpaper(wp.src)}
                      className={
                        'relative rounded-xl overflow-hidden h-16 cursor-pointer border-2 transition-all ' +
                        (settingsBgMode === 'image' && settingsBg === wp.src
                          ? 'border-indigo-600 shadow-md scale-[1.02]'
                          : 'border-transparent hover:opacity-90')
                      }
                    >
                      <img src={wp.src} alt={wp.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-1">
                        <span className="text-[11px] font-bold text-white text-center drop-shadow-xs">
                          {wp.name}
                        </span>
                      </div>
                      {settingsBgMode === 'image' && settingsBg === wp.src && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── YouTube Video Picker ─── */}
            {settingsBgMode === 'video' && (
              <div className="mb-6 animate-in fade-in slide-in-from-right-2 duration-200">
                <label className="text-xs font-semibold text-gray-700 block mb-2 flex items-center gap-1.5">
                  <Youtube size={14} className="text-red-500" />
                  Chọn video YouTube làm nền
                </label>

                {/* Custom URL input */}
                <div className="mb-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Dán link YouTube hoặc ID video..."
                        value={ytInput}
                        onChange={(e) => { setYtInput(e.target.value); setYtError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleYtInputSubmit()}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20 transition-all"
                      />
                    </div>
                    <button
                      onClick={handleYtInputSubmit}
                      className="px-3.5 py-2.5 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 transition-colors shadow-xs"
                    >
                      Thêm
                    </button>
                  </div>
                  {ytError && (
                    <p className="text-[11px] text-red-500 mt-1 ml-1">{ytError}</p>
                  )}
                </div>

                {/* Currently selected custom video preview */}
                {settingsYtId && !YOUTUBE_VIDEOS.some((v) => v.id === settingsYtId) && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <img
                      src={`https://img.youtube.com/vi/${settingsYtId}/mqdefault.jpg`}
                      alt="Custom video"
                      className="w-16 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">Video tùy chỉnh</p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">{settingsYtId}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <Check size={10} />
                      </div>
                      <button
                        onClick={handleClearVideo}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-100 transition-colors"
                        title="Xóa video này"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Curated videos grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {YOUTUBE_VIDEOS.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => handleSelectYtVideo(vid.id)}
                      className={
                        'relative rounded-xl overflow-hidden h-16 cursor-pointer border-2 transition-all group ' +
                        (settingsYtId === vid.id
                          ? 'border-red-500 shadow-md scale-[1.02]'
                          : 'border-transparent hover:border-red-200')
                      }
                    >
                      <img
                        src={vid.thumbnail}
                        alt={vid.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-2">
                        <div className="flex items-center gap-1.5 w-full">
                          <MonitorPlay size={11} className="text-white/90 flex-shrink-0" />
                          <span className="text-[10px] font-bold text-white truncate drop-shadow-xs">
                            {vid.name}
                          </span>
                        </div>
                      </div>
                      {settingsYtId === vid.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  💡 Video sẽ phát tự động ở nền — bạn vẫn nghe được âm thanh từ video
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 bg-[#1b2b4f] text-white font-bold text-xs rounded-xl hover:bg-[#152342] transition-colors shadow-sm"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Modal Pet & Break Bank ── */}
      {showPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Bạn đồng hành & Ngân hàng nghỉ
              </h3>
              <button
                onClick={() => setShowPetModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <FocusPetPanel
                currentPetId={currentPetId}
                onSelectPet={(pet) => {
                  setCurrentPetId(pet);
                  localStorage.setItem('pomodoro_focus_pet', pet);
                }}
                petStats={petStats}
                dailySessions={dailyCompletedSessions}
                dailyMinutes={dailyFocusMinutes}
                is3DMode={is3DMode}
                onToggle3D={() => setIs3DMode(!is3DMode)}
              />

              <div className="pt-2 border-t border-gray-100">
                <BreakBankPanel />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

