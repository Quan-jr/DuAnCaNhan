'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Home, 
  Calendar,
  Sparkles,
  ListTodo,
  Timer,
  Video,
  Minus,
  Plus,
  Folder,
  X,
  User,
  Search
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface SubItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  subItems?: SubItem[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home 
  },
  { 
    name: 'Công việc', 
    href: '/tasks', 
    icon: ListTodo,
    subItems: [
      { name: 'Tất cả Task', href: '/tasks' },
      { name: 'Đang thực hiện', href: '/tasks' },
    ]
  },
  { 
    name: 'Pomodoro', 
    href: '/pomodoro', 
    icon: Timer,
    subItems: [
      { name: 'Đồng hồ tập trung', href: '/pomodoro' },
      { name: 'Thú cưng & Break', href: '/pomodoro' },
    ]
  },
  { 
    name: 'Phòng học nhóm', 
    href: '/focus-room', 
    icon: Video,
  },
  { 
    name: 'Lịch biểu', 
    href: '/calendar', 
    icon: Calendar,
  },
  { 
    name: 'Thú cưng 3D', 
    href: '/pet', 
    icon: Sparkles,
  },
  {
    name: 'Đăng nhập / TK',
    href: '/login',
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // State: expanded (full liquid glass menu) or collapsed (narrow liquid glass rail)
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <aside className="hidden lg:flex relative h-full bg-transparent p-3 flex-shrink-0 z-40 select-none">
      {/* ── Morphing Capsule / Liquid Glass Container ── */}
      <div 
        className={`relative flex flex-col justify-between h-full liquid-glass-panel transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'w-64 p-5 rounded-[2.2rem]' : 'w-[58px] py-4 px-2 rounded-[2.2rem] items-center min-h-[520px]'
        }`}
      >
        {/* Top Liquid Glass Highlight Reflection */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 via-white/10 to-transparent pointer-events-none rounded-t-[2.2rem]" />

        {/* ── Top Header with ✦ Star Button ── */}
        <div className={`relative z-10 flex items-center ${isExpanded ? 'justify-between mb-6 px-1' : 'justify-center'}`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleExpand}
              className={`w-10 h-10 rounded-full bg-white text-slate-900 shadow-md border border-gray-100/90 flex items-center justify-center transition-transform duration-500 ease-out active:scale-95 cursor-pointer ${
                isExpanded ? 'rotate-[360deg]' : 'rotate-0 hover:scale-105'
              }`}
              title={isExpanded ? 'Thu gọn Menu' : 'Mở rộng Menu'}
            >
              <svg className="w-5 h-5 fill-slate-900 text-slate-900" viewBox="0 0 24 24">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </button>
            {isExpanded && <h2 className="text-base font-bold text-gray-900 tracking-tight font-sans">Menu</h2>}
          </div>

          {isExpanded && (
            <button
              onClick={toggleExpand}
              className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-600 transition-colors"
              title="Đóng"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Middle: Navigation Links ── */}
        <div className={`relative z-10 flex-1 overflow-y-auto custom-scrollbar ${isExpanded ? 'space-y-1.5 pr-1' : 'flex flex-col items-center justify-center gap-3.5 my-auto'}`}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const hasSub = item.subItems && item.subItems.length > 0;

            if (!isExpanded) {
              // Collapsed view: Narrow Capsule Rail Icons matching reference design
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#111827] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                  title={item.name}
                >
                  <Icon size={19} />
                </Link>
              );
            }

            // Expanded view: Full Liquid Glass Menu Rows
            return (
              <div key={item.name} className="space-y-1 animate-in fade-in duration-300">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#111827] text-white shadow-lg shadow-black/10 border border-white/10'
                      : 'text-gray-800 hover:text-gray-950 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-700'} />
                    <span>{item.name}</span>
                  </div>

                  {hasSub && (
                    <span className="text-xs">
                      {isActive ? <Minus size={14} /> : <Plus size={14} className="text-gray-400" />}
                    </span>
                  )}
                </Link>

                {/* Sub-items Hierarchy */}
                {hasSub && isActive && (
                  <div className="border-l-2 border-gray-400/50 ml-5 pl-3.5 my-1 space-y-1 animate-in fade-in duration-200">
                    {item.subItems!.map((sub, idx) => {
                      const isSubActive = idx === 0;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isSubActive
                              ? 'bg-white/90 backdrop-blur-md text-gray-900 shadow-xs border border-white/80 font-bold'
                              : 'text-gray-700 hover:text-gray-950 hover:bg-white/60'
                          }`}
                        >
                          <Folder size={14} className={isSubActive ? 'text-gray-900' : 'text-gray-400'} />
                          <span>{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bottom: Search / Profile Action ── */}
        <div className={`relative z-10 ${!isExpanded && 'flex flex-col items-center justify-center mt-auto pt-2'}`}>
          {isExpanded ? (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[11px] font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-gray-900">
                  {user?.email?.split('@')[0] || 'Người dùng'}
                </p>
              </div>
            </div>
          ) : (
            <button
              className="w-10 h-10 rounded-full bg-[#111827] text-white shadow-md flex items-center justify-center hover:scale-105 transition-transform active:scale-95 cursor-pointer"
              title="Tìm kiếm"
            >
              <Search size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}




