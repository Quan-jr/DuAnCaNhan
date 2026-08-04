'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ListTodo, 
  Wallet, 
  Briefcase,
  ArrowRightLeft,
  X,
  User,
  Sparkles
} from 'lucide-react';

const menuItems = [
  { name: 'Tổng quan', href: '/', icon: Home, color: 'bg-blue-500 text-white shadow-blue-500/30' },
  { name: 'Task List', href: '/tasks', icon: ListTodo, color: 'bg-purple-500 text-white shadow-purple-500/30' },
  { name: 'Thu nhập', href: '/earnings', icon: Wallet, color: 'bg-emerald-500 text-white shadow-emerald-500/30' },
  { name: 'Ví', href: '/wallets', icon: Briefcase, color: 'bg-amber-500 text-white shadow-amber-500/30' },
  { name: 'Giao dịch', href: '/transactions', icon: ArrowRightLeft, color: 'bg-rose-500 text-white shadow-rose-500/30' },
];

export default function CircularNavMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Close menu when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Radius for radial positioning (in pixels)
  const R = 110;

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Logo Container */}
      <div className="fixed top-5 left-5 z-50">
        {/* Central Logo Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-13 h-13 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-300 transform active:scale-95 group ${
            isOpen 
              ? 'bg-gray-900 border-white text-white rotate-90 scale-105 ring-4 ring-primary/30' 
              : 'bg-white border-primary/20 hover:border-primary hover:scale-110'
          }`}
          title={isOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
        >
          {isOpen ? (
            <X size={22} className="transition-transform duration-300" />
          ) : (
            <div className="w-full h-full p-1 flex items-center justify-center relative">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full group-hover:rotate-12 transition-transform duration-300" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>
          )}
        </button>

        {/* Hovered Item Label Tooltip Badge */}
        {isOpen && hoveredItem && (
          <div className="absolute left-16 top-3 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap animate-in fade-in zoom-in-90 duration-150 flex items-center gap-1.5 border border-white/10 z-50">
            <Sparkles size={12} className="text-amber-400" />
            <span>{hoveredItem}</span>
          </div>
        )}

        {/* Radial Circular Menu Buttons */}
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // Fan out from 0 deg (Right) to 90 deg (Down)
          // 5 items evenly spaced in quarter circle (0, 22.5, 45, 67.5, 90 degrees)
          const angleDeg = (index * 90) / (menuItems.length - 1);
          const angleRad = (angleDeg * Math.PI) / 180;

          // Calculate displacement from logo button center
          const dx = isOpen ? Math.round(R * Math.cos(angleRad)) : 0;
          const dy = isOpen ? Math.round(R * Math.sin(angleRad)) : 0;

          return (
            <div
              key={item.name}
              className={`absolute top-0 left-0 transition-all duration-300 ease-out ${
                isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-50 pointer-events-none'
              }`}
              style={{
                transform: `translate(${dx}px, ${dy}px)`,
                transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
              }}
            >
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-125 relative group ${
                  isActive 
                    ? `${item.color} ring-4 ring-white shadow-xl scale-110` 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-700'} />
                
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                )}

                {/* Individual floating tooltip label */}
                <span className="absolute left-14 bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-md">
                  {item.name}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* User profile floating badge (when menu is open) */}
      {isOpen && (
        <div className="fixed top-5 left-56 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-100 animate-in fade-in slide-in-from-left-4 duration-300">
          <img 
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
            alt="User" 
            className="w-7 h-7 rounded-full border border-gray-200" 
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900 leading-tight">Dương Minh Quân</span>
            <span className="text-[10px] text-gray-500 leading-tight">duongminhquan@gmail.com</span>
          </div>
        </div>
      )}
    </>
  );
}
