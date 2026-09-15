'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Heart, Crown, Award, ChevronRight } from 'lucide-react';

const Pomodoro3DPet = dynamic(() => import('./Pomodoro3DPet'), {
  ssr: false,
  loading: () => (
    <div className="w-36 h-36 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-rose-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

export type PetId = 'cat' | 'shiba' | 'bunny' | 'panda' | 'dragon' | 'penguin';

export interface PetInfo {
  id: PetId;
  name: string;
  avatar: string;
  description: string;
  themeColor: string;
}

export const AVAILABLE_PETS: PetInfo[] = [
  { id: 'cat', name: 'Mèo Mochi', avatar: '🐱', description: 'Mèo con lười nhưng chăm học', themeColor: '#f43f5e' },
  { id: 'shiba', name: 'Cún Corgi', avatar: '🐶', description: 'Cún con trung thành & năng động', themeColor: '#f59e0b' },
  { id: 'bunny', name: 'Thỏ Mây', avatar: '🐰', description: 'Thỏ bông ngọt ngào, kiên trì', themeColor: '#ec4899' },
  { id: 'panda', name: 'Gấu Trúc Po', avatar: '🐼', description: 'Bình tĩnh, tập trung sâu sắc', themeColor: '#10b981' },
  { id: 'dragon', name: 'Rồng Nhí Py', avatar: '🐲', description: 'Bé rồng phép thuật đam mê học', themeColor: '#8b5cf6' },
  { id: 'penguin', name: 'Cánh Cụt Pingu', avatar: '🐧', description: 'Bền bỉ vượt qua mọi thử thách', themeColor: '#0ea5e9' },
];

interface FocusPetVisualProps {
  petId: PetId;
  totalMinutes: number; // accumulated focus minutes
  isRunning: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  size?: 'sm' | 'md' | 'lg';
  is3D?: boolean;
}

const MINUTES_PER_STAGE = 600; // 10 hours per stage
const MAX_STAGE = 3;

export function FocusPetVisual({
  petId,
  totalMinutes,
  isRunning,
  mode,
  size = 'md',
  is3D = true,
}: FocusPetVisualProps) {
  // Determine growth stage
  const stage = Math.min(MAX_STAGE, Math.floor(totalMinutes / MINUTES_PER_STAGE));
  
  // Scale smoothly from 0.72 to 1.3 based on overall progress across all stages
  const overallProgress = Math.min(1, totalMinutes / (MINUTES_PER_STAGE * 3));
  const scale = 0.72 + overallProgress * 0.58;

  // If 3D mode is active, render interactive 3D Pet
  if (is3D) {
    return (
      <div className="relative flex flex-col items-center justify-center select-none pointer-events-auto -mt-3">
        {/* Floating hearts / sparkles when timer is running */}
        {isRunning && (
          <div className="absolute -top-1 right-2 flex gap-1 z-30 animate-bounce pointer-events-none">
            <Heart size={14} className="text-rose-400 fill-rose-400 animate-ping opacity-75" />
            <Sparkles size={14} className="text-amber-400 fill-amber-400 animate-spin" />
          </div>
        )}
        <Pomodoro3DPet petId={petId} isRunning={isRunning} mode={mode} />
      </div>
    );
  }

  // Render specific animal SVG with animations
  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Floating Aura / Sparkles when approaching full growth */}
      {stage === 3 && (
        <div className="absolute -inset-4 rounded-full bg-radial from-amber-300/30 via-rose-300/10 to-transparent blur-md animate-pulse" />
      )}

      {/* Floating hearts / sparkles when timer is running */}
      {isRunning && (
        <div className="absolute -top-3 right-1 flex gap-1 z-20 animate-bounce">
          <Heart size={14} className="text-rose-400 fill-rose-400 animate-ping opacity-75" />
          {stage >= 2 && <Sparkles size={14} className="text-amber-400 fill-amber-400 animate-spin" />}
        </div>
      )}

      {/* Pet Canvas with scaling & breathing animation */}
      <div 
        className="transition-transform duration-700 ease-out flex items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <svg
          viewBox="0 0 120 120"
          className={`w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md ${
            isRunning ? 'animate-[bounce_3s_infinite]' : 'animate-[pulse_4s_infinite]'
          }`}
        >
          <defs>
            <linearGradient id="fur-cat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="fur-shiba" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="fur-bunny" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fce7f3" />
            </linearGradient>
            <linearGradient id="fur-dragon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="fur-penguin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="crown-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Background egg shell or nest if stage 0 */}
          {stage === 0 && (
            <g opacity="0.9">
              <ellipse cx="60" cy="98" rx="36" ry="12" fill="#e2e8f0" />
              <path
                d="M 32 90 Q 60 115 88 90 Q 75 75 60 78 Q 45 75 32 90 Z"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Render by Animal Type */}
          {petId === 'cat' && (
            <g>
              {/* Cat Ears */}
              <polygon points="34,42 42,16 56,36" fill="#fb923c" />
              <polygon points="38,40 44,22 52,36" fill="#fecdd3" />
              <polygon points="86,42 78,16 64,36" fill="#fb923c" />
              <polygon points="82,40 76,22 68,36" fill="#fecdd3" />

              {/* Tail */}
              <path
                d="M 86 85 C 105 85, 110 65, 100 55 C 95 50, 90 56, 92 62 C 95 72, 88 80, 82 82 Z"
                fill="#f97316"
                className={isRunning ? 'animate-pulse' : ''}
              />

              {/* Body */}
              <ellipse cx="60" cy="78" rx="32" ry="26" fill="url(#fur-cat)" />
              <ellipse cx="60" cy="82" rx="20" ry="18" fill="#fff7ed" />

              {/* Head */}
              <circle cx="60" cy="52" r="28" fill="url(#fur-cat)" />

              {/* Cheeks */}
              <circle cx="45" cy="58" r="5" fill="#fda4af" opacity="0.7" />
              <circle cx="75" cy="58" r="5" fill="#fda4af" opacity="0.7" />

              {/* Eyes */}
              {mode === 'shortBreak' || mode === 'longBreak' || (!isRunning && stage === 0) ? (
                // Sleeping eyes
                <>
                  <path d="M 44 50 Q 49 55 54 50" fill="none" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 66 50 Q 71 55 76 50" fill="none" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                // Big shiny open eyes
                <>
                  <ellipse cx="48" cy="49" rx="4" ry="5.5" fill="#1c1917" />
                  <circle cx="49.5" cy="47.5" r="1.8" fill="#ffffff" />
                  <ellipse cx="72" cy="49" rx="4" ry="5.5" fill="#1c1917" />
                  <circle cx="73.5" cy="47.5" r="1.8" fill="#ffffff" />
                </>
              )}

              {/* Nose & Mouth */}
              <polygon points="58,56 62,56 60,59" fill="#f43f5e" />
              <path d="M 56 61 Q 60 64 64 61" fill="none" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" />

              {/* Whiskers */}
              <line x1="32" y1="53" x2="42" y2="55" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="32" y1="59" x2="42" y2="58" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="88" y1="53" x2="78" y2="55" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="88" y1="59" x2="78" y2="58" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />

              {/* Paws */}
              <ellipse cx="48" cy="94" rx="8" ry="6" fill="#fff7ed" stroke="#fb923c" strokeWidth="1.5" />
              <ellipse cx="72" cy="94" rx="8" ry="6" fill="#fff7ed" stroke="#fb923c" strokeWidth="1.5" />
            </g>
          )}

          {petId === 'shiba' && (
            <g>
              {/* Shiba Ears */}
              <polygon points="34,42 42,16 56,36" fill="#d97706" />
              <polygon points="38,40 44,22 52,36" fill="#ffffff" />
              <polygon points="86,42 78,16 64,36" fill="#d97706" />
              <polygon points="82,40 76,22 68,36" fill="#ffffff" />

              {/* Body */}
              <ellipse cx="60" cy="78" rx="32" ry="26" fill="url(#fur-shiba)" />
              <ellipse cx="60" cy="84" rx="18" ry="16" fill="#ffffff" />

              {/* Head */}
              <circle cx="60" cy="52" r="28" fill="url(#fur-shiba)" />
              <ellipse cx="60" cy="58" rx="20" ry="16" fill="#ffffff" />

              {/* Cheeks */}
              <circle cx="44" cy="58" r="4.5" fill="#fca5a5" opacity="0.8" />
              <circle cx="76" cy="58" r="4.5" fill="#fca5a5" opacity="0.8" />

              {/* Eyes */}
              <ellipse cx="48" cy="49" rx="3.8" ry="4.5" fill="#1c1917" />
              <circle cx="49.5" cy="47.5" r="1.5" fill="#ffffff" />
              <ellipse cx="72" cy="49" rx="3.8" ry="4.5" fill="#1c1917" />
              <circle cx="73.5" cy="47.5" r="1.5" fill="#ffffff" />

              {/* Eyebrows */}
              <circle cx="48" cy="42" r="2.5" fill="#ffffff" />
              <circle cx="72" cy="42" r="2.5" fill="#ffffff" />

              {/* Snout & Tongue */}
              <ellipse cx="60" cy="56" rx="4.5" ry="3.5" fill="#1c1917" />
              <path d="M 58 60 Q 60 62 62 60" fill="none" stroke="#1c1917" strokeWidth="1.8" />
              <ellipse cx="60" cy="63" rx="3" ry="4" fill="#f43f5e" />

              {/* Paws */}
              <ellipse cx="48" cy="94" rx="8" ry="6" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
              <ellipse cx="72" cy="94" rx="8" ry="6" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
            </g>
          )}

          {petId === 'bunny' && (
            <g>
              {/* Bunny Long Ears */}
              <ellipse cx="45" cy="24" rx="8" ry="22" fill="#ffffff" stroke="#fbcfe8" strokeWidth="2" />
              <ellipse cx="45" cy="24" rx="4.5" ry="16" fill="#f472b6" opacity="0.7" />
              <ellipse cx="75" cy="24" rx="8" ry="22" fill="#ffffff" stroke="#fbcfe8" strokeWidth="2" />
              <ellipse cx="75" cy="24" rx="4.5" ry="16" fill="#f472b6" opacity="0.7" />

              {/* Body */}
              <ellipse cx="60" cy="80" rx="30" ry="26" fill="url(#fur-bunny)" stroke="#fbcfe8" strokeWidth="1.5" />

              {/* Head */}
              <circle cx="60" cy="54" r="26" fill="#ffffff" stroke="#fbcfe8" strokeWidth="1.5" />

              {/* Cheeks */}
              <circle cx="44" cy="59" r="6" fill="#f472b6" opacity="0.6" />
              <circle cx="76" cy="59" r="6" fill="#f472b6" opacity="0.6" />

              {/* Eyes */}
              <ellipse cx="48" cy="51" rx="4" ry="5.5" fill="#831843" />
              <circle cx="49.5" cy="49" r="1.8" fill="#ffffff" />
              <ellipse cx="72" cy="51" rx="4" ry="5.5" fill="#831843" />
              <circle cx="73.5" cy="49" r="1.8" fill="#ffffff" />

              {/* Nose & Mouth */}
              <polygon points="58,58 62,58 60,61" fill="#ec4899" />
              <path d="M 56 63 Q 60 66 64 63" fill="none" stroke="#831843" strokeWidth="1.8" strokeLinecap="round" />

              {/* Paws holding a tiny carrot */}
              <ellipse cx="48" cy="94" rx="7" ry="5.5" fill="#ffffff" stroke="#fbcfe8" strokeWidth="1.5" />
              <ellipse cx="72" cy="94" rx="7" ry="5.5" fill="#ffffff" stroke="#fbcfe8" strokeWidth="1.5" />
              {stage >= 1 && (
                <path d="M 56 75 L 68 85 L 62 87 Z" fill="#ea580c" />
              )}
            </g>
          )}

          {petId === 'panda' && (
            <g>
              {/* Panda Ears */}
              <circle cx="38" cy="34" r="12" fill="#1e293b" />
              <circle cx="82" cy="34" r="12" fill="#1e293b" />

              {/* Body */}
              <ellipse cx="60" cy="80" rx="32" ry="26" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="60" cy="74" rx="32" ry="12" fill="#1e293b" />

              {/* Head */}
              <circle cx="60" cy="54" r="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Eye Patches */}
              <ellipse cx="47" cy="52" rx="7" ry="9" fill="#1e293b" transform="rotate(-15, 47, 52)" />
              <ellipse cx="73" cy="52" rx="7" ry="9" fill="#1e293b" transform="rotate(15, 73, 52)" />

              {/* Eyes */}
              <circle cx="48" cy="51" r="2.8" fill="#ffffff" />
              <circle cx="48.5" cy="50.5" r="1.5" fill="#0f172a" />
              <circle cx="72" cy="51" r="2.8" fill="#ffffff" />
              <circle cx="71.5" cy="50.5" r="1.5" fill="#0f172a" />

              {/* Cheeks */}
              <circle cx="42" cy="62" r="4.5" fill="#fca5a5" opacity="0.7" />
              <circle cx="78" cy="62" r="4.5" fill="#fca5a5" opacity="0.7" />

              {/* Nose & Mouth */}
              <ellipse cx="60" cy="60" rx="4.5" ry="3" fill="#0f172a" />
              <path d="M 57 63 Q 60 66 63 63" fill="none" stroke="#0f172a" strokeWidth="1.8" />

              {/* Paws */}
              <ellipse cx="46" cy="94" rx="8" ry="6" fill="#1e293b" />
              <ellipse cx="74" cy="94" rx="8" ry="6" fill="#1e293b" />
            </g>
          )}

          {petId === 'dragon' && (
            <g>
              {/* Little Wings */}
              <path d="M 32 64 Q 10 50 24 78 Q 28 82 34 78 Z" fill="#8b5cf6" opacity="0.9" />
              <path d="M 88 64 Q 110 50 96 78 Q 92 82 86 78 Z" fill="#8b5cf6" opacity="0.9" />

              {/* Horns */}
              <polygon points="46,36 40,18 50,30" fill="#fbbf24" />
              <polygon points="74,36 80,18 70,30" fill="#fbbf24" />

              {/* Body */}
              <ellipse cx="60" cy="78" rx="30" ry="26" fill="url(#fur-dragon)" />
              <ellipse cx="60" cy="82" rx="18" ry="18" fill="#ddd6fe" />

              {/* Head */}
              <circle cx="60" cy="52" r="27" fill="url(#fur-dragon)" />

              {/* Cheeks */}
              <circle cx="44" cy="58" r="5" fill="#f472b6" opacity="0.7" />
              <circle cx="76" cy="58" r="5" fill="#f472b6" opacity="0.7" />

              {/* Eyes */}
              <ellipse cx="48" cy="49" rx="4.5" ry="6" fill="#312e81" />
              <circle cx="49.5" cy="47" r="2" fill="#ffffff" />
              <ellipse cx="72" cy="49" rx="4.5" ry="6" fill="#312e81" />
              <circle cx="73.5" cy="47" r="2" fill="#ffffff" />

              {/* Cute snout & little fire puff */}
              <ellipse cx="60" cy="58" rx="5" ry="3.5" fill="#5b21b6" />
              {isRunning && (
                <circle cx="60" cy="66" r="3" fill="#f59e0b" className="animate-ping opacity-75" />
              )}

              {/* Paws */}
              <ellipse cx="48" cy="94" rx="7.5" ry="5.5" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5" />
              <ellipse cx="72" cy="94" rx="7.5" ry="5.5" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5" />
            </g>
          )}

          {petId === 'penguin' && (
            <g>
              {/* Penguin Body */}
              <ellipse cx="60" cy="74" rx="32" ry="28" fill="#0f172a" />
              <ellipse cx="60" cy="75" rx="20" ry="22" fill="#ffffff" />

              {/* Flippers */}
              <ellipse cx="28" cy="72" rx="6" ry="16" fill="#0f172a" transform="rotate(20, 28, 72)" />
              <ellipse cx="92" cy="72" rx="6" ry="16" fill="#0f172a" transform="rotate(-20, 92, 72)" />

              {/* Head */}
              <circle cx="60" cy="48" r="24" fill="#0f172a" />
              <circle cx="52" cy="46" r="8" fill="#ffffff" />
              <circle cx="68" cy="46" r="8" fill="#ffffff" />

              {/* Eyes */}
              <circle cx="53" cy="46" r="3.2" fill="#0f172a" />
              <circle cx="54" cy="45" r="1.2" fill="#ffffff" />
              <circle cx="67" cy="46" r="3.2" fill="#0f172a" />
              <circle cx="68" cy="45" r="1.2" fill="#ffffff" />

              {/* Beak */}
              <polygon points="56,52 64,52 60,58" fill="#f59e0b" />

              {/* Scarf if stage >= 1 */}
              {stage >= 1 && (
                <g>
                  <path d="M 42 60 Q 60 66 78 60 Q 60 70 42 60 Z" fill="#ef4444" />
                  <rect x="64" y="62" width="6" height="12" rx="2" fill="#ef4444" />
                </g>
              )}

              {/* Feet */}
              <ellipse cx="48" cy="98" rx="8" ry="5" fill="#f59e0b" />
              <ellipse cx="72" cy="98" rx="8" ry="5" fill="#f59e0b" />
            </g>
          )}

          {/* Crown & Accessories based on stage */}
          {stage === 2 && (
            // Tiny sprout or bow
            <g transform="translate(56, 12)">
              <path d="M 4 14 Q 0 4 8 0 Q 8 8 4 14 Z" fill="#22c55e" />
              <path d="M 4 14 Q 8 6 12 8 Q 8 12 4 14 Z" fill="#16a34a" />
            </g>
          )}

          {stage === 3 && (
            // Golden Crown of Champion!
            <g transform="translate(42, 6)">
              <polygon
                points="0,18 6,8 14,14 22,6 30,14 38,8 44,18"
                fill="url(#crown-grad)"
                stroke="#ca8a04"
                strokeWidth="1.2"
                filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
              />
              <circle cx="6" cy="8" r="1.8" fill="#ef4444" />
              <circle cx="22" cy="6" r="2.2" fill="#3b82f6" />
              <circle cx="38" cy="8" r="1.8" fill="#ef4444" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

interface FocusPetPanelProps {
  currentPetId: PetId;
  onSelectPet: (id: PetId) => void;
  totalMinutes: number; // accumulated focus minutes
  isRunning: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  dailyCompletedSessions: number;
}

export function FocusPetPanel({
  currentPetId,
  onSelectPet,
  totalMinutes,
  isRunning,
  mode,
  dailyCompletedSessions,
}: FocusPetPanelProps) {
  const currentPet = AVAILABLE_PETS.find((p) => p.id === currentPetId) || AVAILABLE_PETS[0];

  const stage = Math.min(MAX_STAGE, Math.floor(totalMinutes / MINUTES_PER_STAGE));
  const progressWithinStage = stage === MAX_STAGE ? 1 : (totalMinutes % MINUTES_PER_STAGE) / MINUTES_PER_STAGE;
  const pct100 = Math.floor(progressWithinStage * 100);

  let stageName = '🥚 Cấp 1: Ấp mầm sơ sinh';
  let stageDesc = 'Bé đang nghỉ ngơi. Hãy tập trung để giúp bé lớn nhanh!';
  if (stage === 3) {
    stageName = '👑 Cấp 4: Trưởng thành huy hoàng';
    stageDesc = 'Tuyệt vời! Bé đã đạt kích thước cực đại với vương miện rực rỡ ✨';
  } else if (stage === 2) {
    stageName = '🐾 Cấp 3: Thiếu niên năng động';
    stageDesc = 'Bé đã phổng phao và tràn đầy năng lượng cùng bạn!';
  } else if (stage === 1) {
    stageName = '🐣 Cấp 2: Thú non tập lớn';
    stageDesc = 'Bé đã mở mắt và bắt đầu khám phá thế giới xung quanh!';
  }

  return (
    <div className="w-full max-w-lg bg-white/90 backdrop-blur-md border border-rose-100 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3.5 z-10">
      {/* Top Header: Pet info & Level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-lg shadow-xs">
            {currentPet.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">{currentPet.name}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                {stageName.split(':')[0]}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 line-clamp-1">{currentPet.description}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm sm:text-base font-black text-rose-500 font-mono">
            {pct100}%
          </span>
          <span className="text-[10px] text-gray-400 block font-medium">Lớn khôn</span>
        </div>
      </div>

      {/* Growth Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 transition-all duration-700 relative overflow-hidden"
            style={{ width: `${Math.max(6, pct100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1 text-rose-600 font-semibold">
            <Sparkles size={11} /> {stageName}
          </span>
          <span>{pct100 >= 100 ? 'Đã hoàn thành phiên 🎉' : `Còn ${100 - pct100}% để đạt cấp kế`}</span>
        </div>
      </div>

      {/* Motivational Note */}
      <div className="bg-rose-50/60 rounded-2xl p-2.5 px-3 border border-rose-100/70 text-[11px] text-rose-800 flex items-center gap-2">
        <span className="text-sm">🌱</span>
        <span className="font-medium flex-1">
          {isRunning 
            ? stageDesc 
            : 'Nhấn Bắt đầu (Play) đồng hồ để thú cưng bắt đầu hấp thụ thời gian và lớn dần nhé!'}
        </span>
      </div>

      {/* Choose Pet Buttons */}
      <div className="pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-gray-700">Đổi thú cưng đồng hành:</span>
          <span className="text-[10px] text-gray-400">Đã nuôi hôm nay: {dailyCompletedSessions} phiên</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {AVAILABLE_PETS.map((pet) => {
            const isSelected = pet.id === currentPetId;
            return (
              <button
                key={pet.id}
                type="button"
                onClick={() => onSelectPet(pet.id)}
                className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105 font-bold'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-102 border border-gray-200/60'
                }`}
                title={pet.name}
              >
                <span className="text-base sm:text-lg mb-0.5">{pet.avatar}</span>
                <span className="text-[9px] sm:text-[10px] truncate max-w-full">
                  {pet.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Link to Full 3D Pet Screen */}
        <div className="mt-3 pt-2 border-t border-rose-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-medium">Muốn nâng cấp, cho ăn & xem Pet 3D lớn?</span>
          <a
            href="/pet"
            className="text-[11px] font-black text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl transition-all flex items-center gap-1 border border-purple-200"
          >
            <span>🎮 Mở Đấu Trường 3D</span>
            <ChevronRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
