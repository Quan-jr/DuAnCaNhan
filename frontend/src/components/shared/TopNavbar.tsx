'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  X
} from 'lucide-react';

const routeTitleMap: Record<string, { title: string; subtitle: string; icon: any }> = {
  '/': { title: 'Tổng quan', subtitle: 'Bảng điều khiển cá nhân', icon: Home },
  '/tasks': { title: 'Công việc', subtitle: 'Danh sách & tiến độ task', icon: ListTodo },
  '/earnings': { title: 'Thu nhập', subtitle: 'Lịch sử & nguồn thu', icon: Wallet },
  '/wallets': { title: 'Ví tiền', subtitle: 'Tài khoản & số dư', icon: Briefcase },
  '/transactions': { title: 'Giao dịch', subtitle: 'Thu chi & chuyển khoản', icon: ArrowRightLeft },
};

export default function TopNavbar() {
  const pathname = usePathname();
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const Icon = routeInfo.icon;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 bg-white z-10 flex items-center gap-3 px-4 h-16 lg:hidden">
          <div className="relative flex-1">
            <input
              autoFocus
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            className="p-2 rounded-xl bg-gray-100 text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-3">
        {/* Left: Logo space + Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 pl-14 sm:pl-16 min-w-0">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-xl min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon size={13} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-900 leading-none truncate">
                {routeInfo.title}
              </span>
              <span className="text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:inline-block">
                {routeInfo.subtitle}
              </span>
            </div>
          </div>

          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Sẵn sàng
          </span>
        </div>

        {/* Center: Search Bar (desktop only) */}
        <div className="hidden lg:flex flex-1 max-w-md items-center justify-center">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
              placeholder="Tìm kiếm công việc, thu nhập, giao dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-semibold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search (mobile only) */}
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 transition-colors"
          >
            <Search size={16} />
          </button>

          {/* Date badge (hidden on small mobile, show sm+) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium text-gray-600">
            <Calendar size={13} className="text-primary shrink-0" />
            <span className="hidden md:inline">{currentDateStr || 'Đang tải...'}</span>
            <span className="md:hidden text-[11px]">
              {currentDateStr ? currentDateStr.split(', ')[1] : ''}
            </span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowNotifications(!showNotifications); setShowUserDropdown(false); }}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 transition-colors relative"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
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
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs flex gap-2">
                    <TrendingUp size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Ghi nhận thu nhập</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Hệ thống đã cập nhật số dư ví.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifications(false); }}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pr-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors"
            >
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                  alt="Dương Minh Quân"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight">Dương Minh Quân</span>
                <span className="text-[10px] text-emerald-600 font-semibold leading-tight">Quản trị viên</span>
              </div>
              <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1">
                <div className="p-2 border-b border-gray-100 mb-1">
                  <p className="text-xs font-bold text-gray-900">Dương Minh Quân</p>
                  <p className="text-[10px] text-gray-400">duongminhquan@gmail.com</p>
                </div>
                <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  Hồ sơ cá nhân
                </button>
                <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  Gói VIP Pro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
