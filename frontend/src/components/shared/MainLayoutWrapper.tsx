'use client';
import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoScrollPage = pathname === '/' || pathname === '/calendar' || pathname === '/pomodoro' || pathname === '/focus-room';

  if (isNoScrollPage) {
    return (
      <main className="flex-1 flex flex-col overflow-hidden w-full h-full relative">
        {children}
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-y-auto w-full relative">
      <div className="p-4 sm:p-6 lg:p-8 xl:px-10 pb-24 grow shrink-0 w-full">
        {children}
      </div>
    </main>
  );
}
