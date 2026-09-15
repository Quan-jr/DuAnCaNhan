'use client';
import { useCalendarState } from '@/hooks/useCalendarState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import DesktopCalendar from './DesktopCalendar';
import MobileCalendar from './MobileCalendar';

export default function GoogleCalendarView() {
  const state = useCalendarState();
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return <MobileCalendar state={state} />;
  }

  return <DesktopCalendar state={state} />;
}
