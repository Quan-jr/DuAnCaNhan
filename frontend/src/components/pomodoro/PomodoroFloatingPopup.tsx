'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Maximize2, 
  Minimize2, 
  X, 
  Timer, 
  Coffee, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { usePomodoro } from '@/context/PomodoroContext';

export default function PomodoroFloatingPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    mode,
    timeLeft,
    totalSeconds,
    isRunning,
    setIsRunning,
    resetTimer,
    skipSession,
    formatTime,
    isPopupVisible,
    setIsPopupVisible,
    isMinimized,
    setIsMinimized,
  } = usePomodoro();

  // Hide popup if user is currently on the main /pomodoro page
  if (pathname === '/pomodoro' || !isPopupVisible) {
    return null;
  }

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  // 1. Minimized Pill mode (super compact)
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-gray-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-full shadow-2xl border border-white/15 animate-in fade-in slide-in-from-bottom-4 duration-200 cursor-pointer group hover:scale-105 transition-all"
        onClick={() => setIsMinimized(false)}
        title="Nhấp để mở rộng đồng hồ Pomodoro"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${
          isRunning ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
        }`} />
        <span className="text-xs font-black font-mono tracking-wider">
          {mode === 'focus' ? '🍅' : '☕'} {formatTime(timeLeft)}
        </span>
        
        {/* Quick Play / Pause without expanding */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsRunning(!isRunning);
          }}
          className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
        </button>

        {/* Maximize to page */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push('/pomodoro');
          }}
          className="p-1 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          title="Vào trang Pomodoro toàn màn hình"
        >
          <Maximize2 size={12} />
        </button>
      </div>
    );
  }

  // 2. Expanded Floating Mini Player Card
  return (
    <div className="fixed bottom-5 right-5 z-50 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-gray-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
            mode === 'focus' 
              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
              : 'bg-teal-50 text-teal-600 border border-teal-100'
          }`}>
            {mode === 'focus' ? '🍅 Tập trung' : '☕ Nghỉ ngơi'}
          </span>
          {isRunning && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          {/* Minimize to small pill */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Thu nhỏ thành thanh nổi"
          >
            <Minimize2 size={14} />
          </button>

          {/* Open full page */}
          <button
            type="button"
            onClick={() => router.push('/pomodoro')}
            className="p-1.5 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            title="Mở toàn màn hình"
          >
            <Maximize2 size={14} />
          </button>

          {/* Close/Hide popup */}
          <button
            type="button"
            onClick={() => setIsPopupVisible(false)}
            className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ẩn đồng hồ nổi"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="flex items-center justify-between px-2">
        <div>
          <span className="text-3xl sm:text-4xl font-black font-mono text-gray-900 tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {isRunning ? 'Đang bấm giờ...' : 'Tạm dừng'}
          </p>
        </div>

        {/* Play / Pause button */}
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${
            mode === 'focus' 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' 
              : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30'
          }`}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-1.5 rounded-full transition-all duration-1000 ${
            mode === 'focus' ? 'bg-rose-500' : 'bg-teal-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={resetTimer}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-[11px] font-medium"
        >
          <RotateCcw size={12} />
          <span>Đặt lại</span>
        </button>

        <button
          type="button"
          onClick={skipSession}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-[11px] font-medium"
        >
          <span>Bỏ qua</span>
          <SkipForward size={12} />
        </button>

        <button
          type="button"
          onClick={() => router.push('/pomodoro')}
          className="text-primary font-bold text-[11px] hover:underline"
        >
          Xem chi tiết &gt;
        </button>
      </div>
    </div>
  );
}
