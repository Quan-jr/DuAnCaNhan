'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Bell, 
  Calendar, 
  User, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown,
  TrendingUp,
  ListTodo,
  Wallet,
  Briefcase,
  ArrowRightLeft,
  Home,
  X,
  Flame,
  Snowflake,
  Shield,
  Timer,
  Users,
  LogOut
} from 'lucide-react';
import StudyStreakModal from './StudyStreakModal';
import FriendListSidebar from './FriendListSidebar';
import { getStreakState, subscribeStreak, StreakState } from '@/lib/studyStreak';
import { usePomodoro } from '@/context/PomodoroContext';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

const routeTitleMap: Record<string, { title: string; subtitle: string; icon: any }> = {
  '/': { title: 'Tổng quan', subtitle: 'Bảng điều khiển cá nhân', icon: Home },
  '/calendar': { title: 'Lịch biểu', subtitle: 'Lịch trình & thời gian biểu Google Calendar', icon: Calendar },
  '/pet': { title: 'Thú cưng 3D', subtitle: 'Nuôi & nâng cấp Pet 3D', icon: Sparkles },
  '/tasks': { title: 'Công việc', subtitle: 'Danh sách & tiến độ task', icon: ListTodo },
  '/pomodoro': { title: 'Pomodoro', subtitle: 'Tập trung học & giữ chuỗi', icon: Timer },
};

export default function TopNavbar() {
  const pathname = usePathname();
  const isPomodoro = pathname === '/pomodoro';
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [streakState, setStreakState] = useState<StreakState | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showFriendSidebar, setShowFriendSidebar] = useState(false);
  const { isRunning, timeLeft, formatTime, setIsPopupVisible } = usePomodoro();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    setStreakState(getStreakState());
    const unsub = subscribeStreak(() => {
      setStreakState(getStreakState());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const today = new Date();
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const daysFull = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setCurrentDateStr(`${daysFull[today.getDay()]}, ${dd}/${mm}/${yyyy}`);
  }, []);

  const routeInfo = routeTitleMap[pathname] || {
    title: 'Quản lý',
    subtitle: 'Hệ thống quản lý thông minh',
    icon: Sparkles,
  };

  return (
    <header className="sticky top-0 z-30 w-full liquid-glass-nav text-gray-900 transition-all pt-2 pb-1">
      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl z-10 flex items-center gap-3 px-4 h-16 lg:hidden">
          <div className="relative flex-1">
            <input
              autoFocus
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/90 border border-white/80 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            className="p-2 rounded-full bg-white text-gray-600 border border-gray-200"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-14 flex items-center justify-between gap-3">
        {/* Left: Spacer */}
        {!isPomodoro && <div className="flex-1 min-w-0"></div>}

        {/* Center: Search Bar or Portal */}
        {isPomodoro ? (
          <div id="pomodoro-navbar-portal" className="flex-1 flex items-center justify-start h-full px-2 w-full" />
        ) : (
          <div className="hidden lg:flex flex-1 max-w-lg items-center justify-center mx-8">
            <div className="relative w-full">
              <input
                type="text"
                className="w-full pl-10 pr-16 py-2 text-[13px] liquid-glass-btn rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                placeholder="Tìm kiếm công việc, lịch biểu, phòng học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                Ctrl + K
              </kbd>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isPomodoro && (
            <>
              {/* Search (mobile only) */}
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 transition-colors"
              >
                <Search size={16} />
              </button>

              {/* Lịch biểu Quick Nav Button (Styled like image) */}
              <Link
                href="/calendar"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Calendar size={18} className="text-gray-500" />
                <span>Lịch biểu</span>
              </Link>
            </>
          )}

          {/* Date badge (clickable to calendar) */}
          <Link 
            href="/calendar"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-medium text-gray-600 transition-colors cursor-pointer"
            title="Xem Lịch biểu chi tiết"
          >
            <Calendar size={13} className="text-primary shrink-0" />
            <span className="hidden md:inline">{currentDateStr || 'Đang tải...'}</span>
            <span className="md:hidden text-[11px]">
              {currentDateStr ? currentDateStr.split(', ')[1] : ''}
            </span>
          </Link>

          {/* Study Streak Badge */}
          {streakState && (
            <button
              type="button"
              onClick={() => {
                setShowStreakModal(true);
                setShowNotifications(false);
                setShowUserDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                streakState.isTodayFrozen
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100'
                  : streakState.isTodayCompleted
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : 'bg-orange-50/70 border-orange-100 text-orange-600 hover:bg-orange-100'
              }`}
              title={
                streakState.isTodayFrozen
                  ? 'Chuỗi học đang được giữ hôm nay ❄️'
                  : streakState.isTodayCompleted
                    ? 'Đã hoàn thành học hôm nay 🔥'
                    : 'Chuỗi học tập - Nhấp để xem và giữ chuỗi'
              }
            >
              {streakState.isTodayFrozen ? (
                <Snowflake size={14} className="text-cyan-600 animate-pulse" />
              ) : (
                <Flame size={14} className="text-amber-500 fill-amber-500" />
              )}
              <span>{streakState.currentStreak} Ngày</span>
              {streakState.isTodayFrozen && (
                <span className="hidden sm:inline text-[9px] bg-cyan-200 text-cyan-800 px-1 py-0.2 rounded font-semibold">Giữ chuỗi</span>
              )}
            </button>
          )}

          {/* Quick Pomodoro Button */}
          <Link
            href="/pomodoro"
            onClick={() => setIsPopupVisible(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
              pathname === '/pomodoro'
                ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20'
                : isRunning
                  ? 'bg-rose-500 text-white border-rose-600 shadow-rose-500/30 animate-pulse'
                  : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
            }`}
            title={isRunning ? `Đang tập trung: ${formatTime(timeLeft)} - Nhấp để xem` : 'Đồng hồ Pomodoro tập trung học tập'}
          >
            <Timer size={14} className={pathname === '/pomodoro' || isRunning ? 'text-white' : 'text-rose-500'} />
            <span>
              {isRunning && pathname !== '/pomodoro' ? (
                <span>🍅 {formatTime(timeLeft)}</span>
              ) : (
                <span className="hidden sm:inline">Pomodoro</span>
              )}
            </span>
          </Link>

          {/* Friends Button */}
          <button
            type="button"
            onClick={() => setShowFriendSidebar(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-100 text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all shadow-2xs active:scale-95"
            title="Bạn bè & Học nhóm"
          >
            <Users size={14} />
            <span className="hidden sm:inline">Bạn bè</span>
          </button>

          {/* Notification Bell */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => { setShowNotifications(!showNotifications); setShowUserDropdown(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors relative"
            >
              <div className="relative">
                <Bell size={18} className="text-gray-500" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">5</span>
              </div>
              <span>Thông báo</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <h4 className="text-xs font-bold text-gray-900">Thông báo mới</h4>
                  <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">2 chưa đọc</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs flex gap-2">
                    <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Task hoàn thành</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Bạn có 1 công việc cần xử lý hôm nay.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifications(false); }}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 transition-colors"
            >
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                alt="Dương Minh Quân"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">Dương Minh Quân</span>
                <span className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">Quản trị viên</span>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1">
                <div className="p-2 border-b border-gray-100 mb-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{user?.user_metadata?.full_name || 'Người dùng'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
                <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  Hồ sơ cá nhân
                </button>
                <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  Gói VIP Pro
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} className="text-red-400" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Study Streak Modal */}
      <StudyStreakModal 
        isOpen={showStreakModal} 
        onClose={() => setShowStreakModal(false)} 
      />

      {/* Friend List Sidebar */}
      <FriendListSidebar
        isOpen={showFriendSidebar}
        onClose={() => setShowFriendSidebar(false)}
      />
    </header>
  );
}
