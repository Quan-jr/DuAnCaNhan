'use client';

import React from 'react';
import { Coffee, Gift, Sparkles, Clock } from 'lucide-react';

interface BreakBankPanelProps {
  accumulatedFocusMinutes: number; // The current progress towards 50
  bankedBreakMinutes: number; // Total accumulated break time
  isRunning: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  isSpending: boolean;
  onStartSpending: () => void;
  onStopSpending: () => void;
}

export function BreakBankPanel({
  accumulatedFocusMinutes,
  bankedBreakMinutes,
  isRunning,
  mode,
  isSpending,
  onStartSpending,
  onStopSpending,
}: BreakBankPanelProps) {
  const MAX_FOCUS = 50;
  const progressPercent = Math.min(100, Math.max(0, (accumulatedFocusMinutes / MAX_FOCUS) * 100));

  const formatBankedTime = (minutes: number) => {
    if (minutes <= 0) return '0 phút';
    if (isSpending) {
      const m = Math.floor(minutes);
      const s = Math.floor((minutes - m) * 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return `${Math.floor(minutes)} phút`;
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-6 w-full transition-all">
      {/* Icon + Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
          <Coffee className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
        <div className="hidden sm:block">
          <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
            Thanh Giải Lao
            {isRunning && mode === 'focus' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
              </span>
            )}
          </h4>
          <p className="text-[10px] text-gray-500 line-clamp-1 leading-tight">Học 50p ➔ Thưởng 10p</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 px-1 sm:px-4 w-full min-w-[60px]">
        <div className="w-full h-1.5 sm:h-2 bg-gray-100/80 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400 transition-all duration-700 relative overflow-hidden"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          >
            {isRunning && mode === 'focus' && (
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1 text-teal-600 font-semibold">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {Math.floor(accumulatedFocusMinutes)}/{MAX_FOCUS}p
          </span>
          <span className="hidden md:inline">
            {accumulatedFocusMinutes >= MAX_FOCUS 
              ? 'Sắp có thưởng! 🎉' 
              : `Cần ${Math.ceil(MAX_FOCUS - accumulatedFocusMinutes)}p`}
          </span>
        </div>
      </div>

      {/* Action / Value */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 sm:border-l border-gray-100 sm:pl-4">
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-sm font-black text-teal-600 font-mono flex items-center gap-1 leading-tight">
            <Gift className={`w-3 h-3 sm:w-4 sm:h-4 ${bankedBreakMinutes > 0 && !isSpending ? "text-rose-500 animate-pulse" : "text-gray-300"}`} />
            {formatBankedTime(bankedBreakMinutes)}
          </span>
        </div>
        {isSpending ? (
          <button 
            onClick={onStopSpending}
            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-bold tracking-wide uppercase transition-colors flex items-center gap-1"
          >
            Dừng
          </button>
        ) : (
          <button 
            onClick={onStartSpending}
            disabled={bankedBreakMinutes <= 0}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-[11px] font-bold tracking-wide uppercase transition-colors ${
              bankedBreakMinutes > 0 
              ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-500/30' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Tiêu
          </button>
        )}
      </div>
    </div>
  );
}
