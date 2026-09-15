'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Shield, 
  Snowflake, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Info,
  Calendar,
  BookOpen,
  ArrowRight,
  Plus,
  Timer
} from 'lucide-react';
import { 
  getStreakState, 
  toggleTodayFreeze, 
  checkInTodayStudy, 
  subscribeStreak, 
  addStreakFreeze,
  isLearningTask,
  StreakState 
} from '@/lib/studyStreak';

interface StudyStreakCardProps {
  tasks?: any[];
  onCompleteTask?: (task: any) => void;
}

export default function StudyStreakCard({ tasks = [], onCompleteTask }: StudyStreakCardProps) {
  const [streakState, setStreakState] = useState<StreakState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Đọc state ban đầu
    setStreakState(getStreakState());

    // Lắng nghe thay đổi
    const unsubscribe = subscribeStreak(() => {
      setStreakState(getStreakState());
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleFreeze = () => {
    const res = toggleTodayFreeze();
    showToast(res.message);
  };

  const handleCheckIn = () => {
    const next = checkInTodayStudy();
    if (next.isTodayCompleted) {
      showToast('Tuyệt vời! Bạn đã hoàn thành việc học hôm nay và duy trì chuỗi học tập 🔥');
    } else {
      showToast('Đã hủy điểm danh học hôm nay.');
    }
  };

  const handleClaimRewardFreeze = () => {
    if (!streakState) return;
    if (streakState.freezesRemaining >= streakState.maxFreezes) {
      showToast('Bạn đã đạt tối đa 3 Khiên giữ chuỗi rồi!');
      return;
    }
    addStreakFreeze(1);
    showToast('Chúc mừng! Bạn đã nhận thêm 1 Khiên giữ chuỗi học 🛡️');
  };

  if (!streakState) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  // Lọc các task học tập hôm nay
  const learningTasks = tasks.filter(t => 
    isLearningTask(t.title, t.icon) && t.status !== 'Hoàn thành' && t.status !== 'Hủy bỏ'
  );

  const isFrozen = streakState.isTodayFrozen;
  const isCompleted = streakState.isTodayCompleted;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all relative">
      {/* Toast notification */}
      {toastMessage && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-gray-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles size={15} className="text-amber-400 shrink-0" />
          <span className="flex-1 font-medium">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white text-[11px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header card */}
      <div className="p-5 pb-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-gray-50/70 to-white">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isFrozen 
              ? 'bg-cyan-50 text-cyan-600 ring-2 ring-cyan-100' 
              : isCompleted 
                ? 'bg-amber-50 text-amber-600 ring-2 ring-amber-100' 
                : 'bg-orange-50 text-orange-600'
          }`}>
            {isFrozen ? <Snowflake size={20} className="animate-spin-slow" /> : <Flame size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-gray-900">Chuỗi học tập</h3>
              <button 
                type="button" 
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Tìm hiểu về Giữ chuỗi học"
              >
                <Info size={13} />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              {isFrozen 
                ? 'Đã bật khiên giữ chuỗi hôm nay' 
                : isCompleted 
                  ? 'Đã hoàn thành mục tiêu học hôm nay' 
                  : 'Duy trì học tập liên tục mỗi ngày'}
            </p>
          </div>
        </div>

        {/* Khiên giữ chuỗi status badge */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-50/80 border border-cyan-100 text-cyan-700 text-xs font-bold"
          title={`Bạn có ${streakState.freezesRemaining} khiên giữ chuỗi`}
        >
          <Shield size={14} className="text-cyan-600" />
          <span>{streakState.freezesRemaining} khiên</span>
          {streakState.freezesRemaining < streakState.maxFreezes && (
            <button 
              type="button"
              onClick={handleClaimRewardFreeze}
              className="ml-0.5 w-4 h-4 rounded-full bg-cyan-200 hover:bg-cyan-300 text-cyan-800 flex items-center justify-center text-[10px] transition-colors"
              title="Nhận thêm 1 khiên giữ chuỗi"
            >
              <Plus size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Explanation drawer if clicked info */}
      {showExplanation && (
        <div className="p-3.5 mx-5 mt-4 rounded-xl bg-cyan-50/50 border border-cyan-100/80 text-[11px] text-cyan-900 leading-relaxed animate-in fade-in duration-200">
          <p className="font-bold flex items-center gap-1 text-cyan-800 mb-1">
            <Shield size={13} /> Khiên giữ chuỗi học (Streak Freeze) là gì?
          </p>
          <p>
            Khi bạn có ngày bận rộn đột xuất không kịp học, hãy bấm <strong>&ldquo;Kích hoạt giữ chuỗi học&rdquo;</strong>. 
            Hệ thống sẽ dùng 1 khiên để <strong>đóng băng chuỗi 24h</strong>, giúp bạn không bị mất chuỗi ngày học liên tiếp!
          </p>
        </div>
      )}

      {/* Hero Streak Count & Status Banner */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/60 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-300/20 blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${
              isFrozen 
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 shadow-cyan-500/20' 
                : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/25'
            }`}>
              {isFrozen ? (
                <Snowflake size={26} className="animate-pulse" />
              ) : (
                <Flame size={28} className="animate-bounce" style={{ animationDuration: '2s' }} />
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  {streakState.currentStreak}
                </span>
                <span className="text-xs font-bold text-gray-600">Ngày liên tiếp</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Award size={13} className="text-amber-500" />
                <span className="text-[11px] text-gray-500 font-medium">
                  Kỷ lục cao nhất: <strong className="text-gray-700">{streakState.longestStreak} ngày</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            {isFrozen ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800 text-[11px] font-bold border border-cyan-200">
                <Snowflake size={12} /> Đang giữ chuỗi
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 size={12} /> Đã học xong
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                <Flame size={12} /> Cần học hôm nay
              </span>
            )}
          </div>
        </div>

        {/* Weekly 7-Day Tracker Calendar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" />
              Tiến độ tuần này
            </span>
            <span className="text-[11px] text-gray-400">Thứ Hai - Chủ Nhật</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {streakState.weeklyProgress.map((day) => {
              const isToday = day.isToday;
              const status = day.status;

              let bgClasses = 'bg-gray-50 border-gray-100 text-gray-400';
              let iconElement = null;

              if (status === 'completed') {
                bgClasses = 'bg-amber-500 text-white border-amber-500 shadow-xs shadow-amber-500/20';
                iconElement = <Flame size={12} fill="currentColor" />;
              } else if (status === 'frozen') {
                bgClasses = 'bg-cyan-500 text-white border-cyan-500 shadow-xs shadow-cyan-500/20';
                iconElement = <Snowflake size={12} />;
              } else if (isToday) {
                bgClasses = 'bg-white border-amber-300 text-amber-600 ring-2 ring-amber-200/60';
                iconElement = <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />;
              } else if (status === 'missed') {
                bgClasses = 'bg-gray-100 border-gray-200 text-gray-300';
                iconElement = <span className="text-[10px] leading-none">✕</span>;
              }

              return (
                <div
                  key={day.dayName}
                  className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl border transition-all text-center ${bgClasses}`}
                >
                  <span className={`text-[10px] font-semibold leading-none ${
                    status === 'completed' || status === 'frozen' ? 'text-white/90' : isToday ? 'text-amber-700 font-bold' : 'text-gray-400'
                  }`}>
                    {day.dayName}
                  </span>

                  <div className="h-4 my-1 flex items-center justify-center">
                    {iconElement || <span className="text-[10px] font-medium leading-none">{day.dayNumber}</span>}
                  </div>

                  <span className={`text-[9px] leading-none ${
                    status === 'completed' || status === 'frozen' ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {status === 'completed' ? 'Xong' : status === 'frozen' ? 'Giữ' : day.dayNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Controls & Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Nút 1: Điểm danh học tập */}
          <button
            type="button"
            onClick={handleCheckIn}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Đã học hôm nay</span>
              </>
            ) : (
              <>
                <Flame size={14} />
                <span>Điểm danh học</span>
              </>
            )}
          </button>

          {/* Nút 2: Giữ chuỗi học (Streak Freeze) */}
          <button
            type="button"
            onClick={handleToggleFreeze}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 ${
              isFrozen
                ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-cyan-500/20'
                : 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
            }`}
          >
            <Shield size={14} className={isFrozen ? 'text-white' : 'text-cyan-600'} />
            <span>{isFrozen ? 'Hủy giữ chuỗi' : 'Giữ chuỗi học'}</span>
          </button>
        </div>

        {/* Nút 3: Bật Pomodoro để tập trung học */}
        <Link
          href="/pomodoro"
          className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-2xs group"
        >
          <Timer size={14} className="text-rose-500 group-hover:rotate-12 transition-transform" />
          <span>🍅 Mở đồng hồ Pomodoro tập trung học</span>
        </Link>

        {/* Học tập ngay: Task học tập chưa làm */}
        {learningTasks.length > 0 && (
          <div className="mt-1 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                <BookOpen size={12} className="text-primary" />
                Task học tập để giữ chuỗi:
              </span>
              <span className="text-[10px] text-gray-400">{learningTasks.length} việc</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-0.5">
              {learningTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50/90 border border-gray-100 hover:bg-gray-100/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen size={13} className="text-blue-500 shrink-0" />
                    <span className="text-gray-800 font-medium truncate text-[11px]">{task.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onCompleteTask) onCompleteTask(task);
                      checkInTodayStudy();
                      showToast(`Đã hoàn thành "${task.title}" & duy trì chuỗi học! 🔥`);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-primary font-bold hover:bg-primary hover:text-white transition-colors shrink-0 ml-1"
                  >
                    Hoàn thành
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
