'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkInTodayStudy } from '@/lib/studyStreak';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface CustomMinutes {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

interface PomodoroContextType {
  mode: TimerMode;
  timeLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  customMinutes: CustomMinutes;
  soundEnabled: boolean;
  ambientSound: 'none' | 'rain' | 'waves';
  selectedTaskId: number | null;
  dailyCompletedSessions: number;
  dailyFocusMinutes: number;
  isPopupVisible: boolean;
  isMinimized: boolean;
  setIsRunning: (val: boolean) => void;
  switchMode: (mode: TimerMode) => void;
  resetTimer: () => void;
  skipSession: () => void;
  setCustomMinutes: React.Dispatch<React.SetStateAction<CustomMinutes>>;
  setSoundEnabled: (val: boolean) => void;
  setAmbientSound: (sound: 'none' | 'rain' | 'waves') => void;
  setSelectedTaskId: (id: number | null) => void;
  setIsPopupVisible: (val: boolean) => void;
  setIsMinimized: (val: boolean) => void;
  formatTime: (seconds: number) => string;
}

const DEFAULT_MINUTES: CustomMinutes = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [customMinutes, setCustomMinutes] = useState<CustomMinutes>(DEFAULT_MINUTES);
  const [totalSeconds, setTotalSeconds] = useState<number>(DEFAULT_MINUTES.focus * 60);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_MINUTES.focus * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'waves'>('none');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Floating popup state
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto show popup when timer is active
  useEffect(() => {
    if (isRunning) {
      setIsPopupVisible(true);
    }
  }, [isRunning]);

  // Stats
  const [dailyCompletedSessions, setDailyCompletedSessions] = useState(0);
  const [dailyFocusMinutes, setDailyFocusMinutes] = useState(0);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Load stats from localStorage on mount
  useEffect(() => {
    const todayKey = `pomodoro_stats_${new Date().toISOString().split('T')[0]}`;
    const saved = localStorage.getItem(todayKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDailyCompletedSessions(parsed.sessions || 0);
        setDailyFocusMinutes(parsed.minutes || 0);
      } catch {}
    }
  }, []);

  // Web Audio gentle chime
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  // Ambient sound generator
  useEffect(() => {
    if (ambientSound === 'none' || !isRunning) {
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).stop?.();
          noiseNodeRef.current.disconnect();
        } catch {}
        noiseNodeRef.current = null;
      }
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 0.15;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = ambientSound === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = ambientSound === 'rain' ? 800 : 400;

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(0);
      noiseNodeRef.current = noise;
    } catch {}

    return () => {
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).stop?.();
          noiseNodeRef.current.disconnect();
        } catch {}
        noiseNodeRef.current = null;
      }
    };
  }, [ambientSound, isRunning]);

  // Switch mode
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const secs = customMinutes[newMode] * 60;
    setTimeLeft(secs);
    setTotalSeconds(secs);
  };

  // Reset current session timer
  const resetTimer = () => {
    setIsRunning(false);
    const secs = customMinutes[mode] * 60;
    setTimeLeft(secs);
    setTotalSeconds(secs);
  };

  // Complete / Skip session
  const skipSession = () => {
    playChime();
    setIsRunning(false);

    if (mode === 'focus') {
      const focusMins = Math.round(totalSeconds / 60);
      const newSessions = dailyCompletedSessions + 1;
      const newMinutes = dailyFocusMinutes + focusMins;
      setDailyCompletedSessions(newSessions);
      setDailyFocusMinutes(newMinutes);

      const todayKey = `pomodoro_stats_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(todayKey, JSON.stringify({ sessions: newSessions, minutes: newMinutes }));

      // TỰ ĐỘNG GHI NHẬN & DUY TRÌ CHUỖI HỌC TẬP!
      checkInTodayStudy(true);

      if (newSessions % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('focus');
    }
  };

  // Countdown timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            skipSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, totalSeconds, dailyCompletedSessions, dailyFocusMinutes]);

  // Update browser tab document.title
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const icon = mode === 'focus' ? '🍅' : '☕';

    if (isRunning) {
      document.title = `(${timeStr}) ${icon} Pomodoro | Quản lý cá nhân`;
    } else if (pathname === '/pomodoro') {
      document.title = `Pomodoro | Quản lý cá nhân`;
    } else {
      document.title = `Quản lý cá nhân`;
    }
  }, [timeLeft, isRunning, mode, pathname]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <PomodoroContext.Provider
      value={{
        mode,
        timeLeft,
        totalSeconds,
        isRunning,
        customMinutes,
        soundEnabled,
        ambientSound,
        selectedTaskId,
        dailyCompletedSessions,
        dailyFocusMinutes,
        isPopupVisible,
        isMinimized,
        setIsRunning,
        switchMode,
        resetTimer,
        skipSession,
        setCustomMinutes,
        setSoundEnabled,
        setAmbientSound,
        setSelectedTaskId,
        setIsPopupVisible,
        setIsMinimized,
        formatTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
