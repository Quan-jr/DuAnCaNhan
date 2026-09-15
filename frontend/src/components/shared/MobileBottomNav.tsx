'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, CheckSquare, Timer, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Tổng quan', href: '/', icon: Home },
  { name: 'Lịch biểu', href: '/calendar', icon: Calendar },
  { name: 'Công việc', href: '/tasks', icon: CheckSquare },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Thêm', href: '#more', icon: Menu },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full h-[64px] bg-[#F4F5F8] border-t border-gray-200/80 z-50 px-3 flex items-center justify-around shadow-lg">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={(e) => {
              if (item.href === '#more') {
                e.preventDefault();
              }
            }}
            className="flex flex-col items-center justify-center w-[60px] h-full gap-0.5 active:scale-95 transition-transform"
          >
            <div className={`relative flex items-center justify-center w-9 h-8 rounded-full transition-all duration-200 ${
              isActive ? 'bg-[#111111] text-white shadow-sm' : 'text-gray-500'
            }`}>
              <Icon 
                size={18} 
                strokeWidth={isActive ? 2.2 : 1.8} 
              />
            </div>
            <span className={`text-[10px] font-semibold transition-colors duration-200 ${
              isActive ? 'text-gray-900 font-bold' : 'text-gray-500'
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
