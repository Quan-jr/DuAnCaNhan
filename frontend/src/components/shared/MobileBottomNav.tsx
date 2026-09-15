'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar as CalendarIcon, ListTodo, Timer, Bot } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'AI / Pet', href: '/pet', icon: Bot },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white/90 backdrop-blur-2xl border-t border-white/80 z-[9999] px-2 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.12)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
          >
            <div className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-300 ${
              isActive ? 'bg-slate-900 text-white shadow-md scale-105' : 'text-gray-600 hover:text-gray-900'
            }`}>
              <Icon 
                size={18} 
                strokeWidth={isActive ? 2.4 : 1.8} 
              />
            </div>
            <span className={`text-[10px] font-extrabold tracking-tight transition-colors duration-200 ${
              isActive ? 'text-slate-900' : 'text-gray-500'
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
