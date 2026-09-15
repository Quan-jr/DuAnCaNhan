'use client';
import { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Users, Timer } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: 'work' | 'study' | 'personal' | 'pomodoro';
  color: string;
  description?: string;
  completed?: boolean;
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; label: string; icon: any }> = {
  work: { bg: 'bg-[#EEF2FF]', text: 'text-[#4F46E5]', border: 'border-l-[#4F46E5]', dot: 'bg-[#4F46E5]', label: 'Công việc', icon: Briefcase },
  study: { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', border: 'border-l-[#9333EA]', dot: 'bg-[#9333EA]', label: 'Học tập', icon: GraduationCap },
  personal: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', border: 'border-l-[#16A34A]', dot: 'bg-[#16A34A]', label: 'Cá nhân', icon: Users },
  pomodoro: { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]', border: 'border-l-[#EA580C]', dot: 'bg-[#EA580C]', label: 'Pomodoro Focus', icon: Timer },
};

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Học Next.js 16 & Three.js',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '10:00',
    category: 'study',
    color: '#9333ea',
    description: 'Nghiên cứu tối ưu render WebGL & component 3D'
  },
  {
    id: '2',
    title: 'Phiên Pomodoro Tập trung',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:30',
    endTime: '11:30',
    category: 'pomodoro',
    color: '#f43f5e',
    description: 'Chăm sóc thú cưng 3D & giải quyết 4 task ưu tiên'
  },
  {
    id: '3',
    title: 'Họp Review Dự Án Cá Nhân',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:30',
    category: 'work',
    color: '#3b82f6',
    description: 'Báo cáo tiến độ hoàn thành các tính năng mới'
  },
  {
    id: '4',
    title: 'Tập thể dục & Thư giãn',
    date: new Date().toISOString().split('T')[0],
    startTime: '17:30',
    endTime: '18:30',
    category: 'personal',
    color: '#10b981',
    description: 'Chạy bộ 3km và nghe podcast'
  }
];

export const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00 - 23:00

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [filterCategories, setFilterCategories] = useState<Record<string, boolean>>({
    work: true,
    study: true,
    personal: true,
    pomodoro: true,
  });

  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    category: 'work' | 'study' | 'personal' | 'pomodoro';
    description: string;
  }>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    category: 'study',
    description: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('google_calendar_events');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        setEvents(INITIAL_EVENTS);
      }
    } else {
      setEvents(INITIAL_EVENTS);
      localStorage.setItem('google_calendar_events', JSON.stringify(INITIAL_EVENTS));
    }
  }, []);

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('google_calendar_events', JSON.stringify(newEvents));
  };

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  const headerDateString = `${monthNames[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;

  const isToday = (d: Date) => {
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCreateEvent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      category: formData.category,
      color: formData.category === 'work' ? '#3b82f6' : formData.category === 'study' ? '#9333ea' : formData.category === 'pomodoro' ? '#f43f5e' : '#10b981',
      description: formData.description,
    };

    saveEvents([...events, newEvent]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      category: 'study',
      description: '',
    });
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
    setSelectedEvent(null);
  };

  const handleApplyAIEvents = (newEvents: CalendarEvent[]) => {
    saveEvents([...events, ...newEvents]);
  };

  const getEventStyle = (evt: CalendarEvent) => {
    const [startH, startM] = evt.startTime.split(':').map(Number);
    const [endH, endM] = evt.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = Math.max(30, endMinutes - startMinutes);

    const top = (startMinutes * 64) / 60;
    const height = (duration * 64) / 60;

    return { top: `${top}px`, height: `${height}px` };
  };

  // Red line top for current time
  const [redLineTop, setRedLineTop] = useState(-1);
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();
      setRedLineTop((currentMinutesFromMidnight * 64) / 60);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    currentDate, setCurrentDate,
    viewMode, setViewMode,
    events, saveEvents,
    isModalOpen, setIsModalOpen,
    selectedEvent, setSelectedEvent,
    isAIModalOpen, setIsAIModalOpen,
    filterCategories, setFilterCategories,
    formData, setFormData,
    handlePrev, handleNext, handleToday,
    getWeekDays, headerDateString, isToday, formatDateKey,
    handleCreateEvent, handleDeleteEvent, handleApplyAIEvents,
    getEventStyle, redLineTop,
    weekDays: getWeekDays()
  };
}
