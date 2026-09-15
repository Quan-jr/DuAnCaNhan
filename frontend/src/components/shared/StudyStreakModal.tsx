'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Flame, 
  Shield, 
  Snowflake, 
  CheckCircle2, 
  X, 
  Award, 
  Sparkles, 
  Calendar,
  Plus
} from 'lucide-react';
import { 
  getStreakState, 
  toggleTodayFreeze, 
  checkInTodayStudy, 
  addStreakFreeze,
  StreakState 
} from '@/lib/studyStreak';

interface StudyStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudyStreakModal({ isOpen, onClose }: StudyStreakModalProps) {
  const [state, setState] = useState<StreakState>(getStreakState());
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setState(getStreakState());
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleFreeze = () => {
    const res = toggleTodayFreeze();
    setState(res.state);
    showToast(res.message);
  };

  const handleCheckIn = () => {
    const next = checkInTodayStudy();
    setState(next);
    if (next.isTodayCompleted) {
      showToast('Tuyệt vời! Đã hoàn thành học hôm nay & giữ chuỗi 🔥');
    } else {
      showToast('Đã hủy điểm danh hôm nay.');
    }
  };

  const handleClaimFreeze = () => {
    if (state.freezesRemaining >= state.maxFreezes) {
      showToast('Đã đạt tối đa 3 khiên giữ chuỗi!');
      return;
    }
    const next = addStreakFreeze(1);
    setState(next);
    showToast('Đã nhận thêm 1 Khiên giữ chuỗi 🛡️');
  };

  if (!isOpen || !mounted) return null;

  const isFrozen = state.isTodayFrozen;
  const isCompleted = state.isTodayCompleted;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} />
      
      <div 
        className="relative bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-150 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Toast */}
        {toast && (
          <div className="absolute top-3 left-6 right-12 z-10 bg-gray-900 text-white text-[11px] px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-1">
            <Sparkles size={13} className="text-amber-400 shrink-0" />
            <span className="truncate">{toast}</span>
          </div>
        )}

        {/* Header Title */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isFrozen ? 'bg-cyan-50 text-cyan-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isFrozen ? <Snowflake size={18} /> : <Flame size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Chuỗi học tập cá nhân</h3>
            <p className="text-[11px] text-gray-500">Giữ chuỗi & Kỷ luật mỗi ngày</p>
          </div>
        </div>

        {/* Hero Visual Banner */}
        <div className={`p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden ${
          isFrozen 
            ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/5 border border-cyan-200' 
            : 'bg-gradient-to-b from-amber-500/10 to-orange-500/5 border border-amber-200'
        }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-1 ${
            isFrozen 
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 shadow-cyan-500/25' 
              : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/25'
          }`}>
            {isFrozen ? (
              <Snowflake size={34} className="animate-pulse" />
            ) : (
              <Flame size={36} className="animate-bounce" style={{ animationDuration: '2s' }} />
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900">{state.currentStreak}</span>
            <span className="text-sm font-bold text-gray-600">Ngày liên tiếp</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Award size={14} className="text-amber-500" />
            <span>Kỷ lục cao nhất: <strong className="text-gray-700">{state.longestStreak} ngày</strong></span>
          </div>

          {isFrozen ? (
            <span className="mt-1 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-bold border border-cyan-200 flex items-center gap-1">
              <Snowflake size={12} /> Đang giữ chuỗi học hôm nay
            </span>
          ) : isCompleted ? (
            <span className="mt-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={12} /> Đã hoàn thành học hôm nay
            </span>
          ) : (
            <span className="mt-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
              <Flame size={12} /> Cần hoàn thành học hôm nay
            </span>
          )}
        </div>

        {/* Khiên giữ chuỗi (Streak Freeze) status */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Khiên giữ chuỗi học</p>
              <p className="text-[10px] text-gray-500">Bảo vệ chuỗi 24h khi có việc bận</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-lg">
              {state.freezesRemaining} / {state.maxFreezes}
            </span>
            {state.freezesRemaining < state.maxFreezes && (
              <button
                type="button"
                onClick={handleClaimFreeze}
                className="w-5 h-5 rounded-full bg-cyan-200 hover:bg-cyan-300 text-cyan-800 flex items-center justify-center text-xs font-bold transition-colors"
                title="Nhận thêm 1 khiên"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        </div>

        {/* 7-Day Tracker */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" /> Tiến độ tuần này:
          </span>
          <div className="grid grid-cols-7 gap-1">
            {state.weeklyProgress.map((day) => {
              let bg = 'bg-gray-50 border-gray-100 text-gray-400';
              if (day.status === 'completed') {
                bg = 'bg-amber-500 text-white border-amber-500';
              } else if (day.status === 'frozen') {
                bg = 'bg-cyan-500 text-white border-cyan-500';
              } else if (day.isToday) {
                bg = 'bg-white border-amber-400 text-amber-600 ring-1 ring-amber-300';
              }

              return (
                <div key={day.dayName} className={`py-1.5 px-0.5 rounded-lg border text-center text-[10px] font-bold ${bg}`}>
                  <p className="text-[9px] opacity-80">{day.dayName}</p>
                  <p className="mt-0.5">{day.dayNumber}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            type="button"
            onClick={handleCheckIn}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={14} />
                <span>Đã học hôm nay</span>
              </>
            ) : (
              <>
                <Flame size={14} />
                <span>Điểm danh học</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleFreeze}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isFrozen
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
            }`}
          >
            <Shield size={14} className={isFrozen ? 'text-white' : 'text-cyan-600'} />
            <span>{isFrozen ? 'Hủy giữ chuỗi' : 'Giữ chuỗi học'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
