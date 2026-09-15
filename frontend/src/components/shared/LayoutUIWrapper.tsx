'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import TopNavbar from '@/components/shared/TopNavbar';
import MainLayoutWrapper from '@/components/shared/MainLayoutWrapper';

export default function LayoutUIWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/';

  const [currentWallpaper, setCurrentWallpaper] = useState<string>('/images/hatsune_miku_bg.jpg');

  useEffect(() => {
    const savedWallpaper = localStorage.getItem('active_app_wallpaper');
    if (savedWallpaper) {
      setCurrentWallpaper(savedWallpaper);
    }

    const handleWallpaperUpdate = () => {
      const updated = localStorage.getItem('active_app_wallpaper');
      if (updated) {
        setCurrentWallpaper(updated);
      }
    };

    window.addEventListener('wallpaper_updated', handleWallpaperUpdate);
    window.addEventListener('storage', handleWallpaperUpdate);
    return () => {
      window.removeEventListener('wallpaper_updated', handleWallpaperUpdate);
      window.removeEventListener('storage', handleWallpaperUpdate);
    };
  }, []);

  if (isLoginPage || isHomePage) {
    return (
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-row w-full h-full relative overflow-hidden bg-slate-950">
      {/* Dynamic User Custom Wallpaper Background Image (Synchronized with Home page) */}
      <img
        src={currentWallpaper || '/images/hatsune_miku_bg.jpg'}
        alt="Desktop Background Wallpaper"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none filter brightness-90 scale-105 transition-all duration-700"
      />

      {/* Subtle Ambient Glass Light Overlay */}
      <div className="absolute inset-0 bg-slate-950/15 backdrop-blur-[1px] pointer-events-none" />

      {/* Main Left Sidebar */}
      <Sidebar />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-transparent text-gray-900 lg:pb-0 pb-[66px] relative z-10">
        <TopNavbar />
        <MainLayoutWrapper>
          {children}
        </MainLayoutWrapper>
      </div>

      <MobileBottomNav />
    </div>
  );
}
