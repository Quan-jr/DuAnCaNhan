'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Heart, 
  Zap, 
  Swords, 
  Shield, 
  Flame, 
  Mountain, 
  Sparkles, 
  RotateCw, 
  Play, 
  Pause,
  ChevronLeft,
  Candy,
  Cherry,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

// Dynamic import with SSR disabled for WebGL/Canvas
const Pet3DViewer = dynamic(() => import('./Pet3DViewer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-purple-600">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-semibold tracking-wider animate-pulse">ĐANG TẢI PET 3D...</span>
    </div>
  )
});

interface PetData {
  id: string;
  name: string;
  species: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  stars: number;
  level: number;
  exp: number;
  maxExp: number;
  elements: { name: string; color: string; icon: typeof Flame }[];
  stats: {
    life: number;
    speed: number;
    attack: number;
    defense: number;
    sAttack: number;
    sDefense: number;
  };
  modelUrl: string;
  scale: number;
  position: [number, number, number];
  iconEmoji: string;
  bgGradient: string;
}

const PETS_ROSTER: PetData[] = [
  {
    id: 'fox',
    name: 'VESUVIAN FOX',
    species: 'Cáo Lửa Hỏa Diệm',
    rarity: 'RARE',
    stars: 4,
    level: 30,
    exp: 170,
    maxExp: 200,
    elements: [
      { name: 'FIRE', color: 'bg-orange-500 text-white', icon: Flame },
      { name: 'EARTH', color: 'bg-amber-700 text-white', icon: Mountain },
    ],
    stats: {
      life: 79,
      speed: 26,
      attack: 52,
      defense: 50,
      sAttack: 36,
      sDefense: 42,
    },
    modelUrl: '/models/fox.glb',
    scale: 0.024,
    position: [0, -1.2, 0],
    iconEmoji: '🦊',
    bgGradient: 'from-orange-50 via-rose-50 to-purple-50',
  },
  {
    id: 'duck',
    name: 'MECHA DUCK',
    species: 'Vịt Cơ Giáp Thủy Tinh',
    rarity: 'EPIC',
    stars: 5,
    level: 25,
    exp: 95,
    maxExp: 150,
    elements: [
      { name: 'WATER', color: 'bg-blue-500 text-white', icon: Flame },
      { name: 'LIGHT', color: 'bg-yellow-500 text-white', icon: Sparkles },
    ],
    stats: {
      life: 92,
      speed: 40,
      attack: 45,
      defense: 65,
      sAttack: 58,
      sDefense: 54,
    },
    modelUrl: '/models/duck.glb',
    scale: 1.2,
    position: [0, -1.2, 0],
    iconEmoji: '🦆',
    bgGradient: 'from-cyan-50 via-blue-50 to-indigo-50',
  },
  {
    id: 'dragon',
    name: 'JADE WYVERN',
    species: 'Thanh Long Cổ Đại',
    rarity: 'LEGENDARY',
    stars: 6,
    level: 45,
    exp: 320,
    maxExp: 500,
    elements: [
      { name: 'DRAGON', color: 'bg-emerald-600 text-white', icon: Flame },
      { name: 'MYSTIC', color: 'bg-purple-600 text-white', icon: Sparkles },
    ],
    stats: {
      life: 140,
      speed: 75,
      attack: 110,
      defense: 95,
      sAttack: 125,
      sDefense: 90,
    },
    modelUrl: '/models/dragon.glb',
    scale: 12.0,
    position: [0, -1.3, 0],
    iconEmoji: '🐲',
    bgGradient: 'from-emerald-50 via-teal-50 to-slate-100',
  }
];

export default function PetGameScreen() {
  const [selectedPetId, setSelectedPetId] = useState<string>('fox');
  const [activeTab, setActiveTab] = useState<'Stats' | 'Moves' | 'Candies'>('Stats');
  const [candies, setCandies] = useState<number>(36);
  const [berries, setBerries] = useState<number>(616053);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState<string>('Survey');
  const [feedNotification, setFeedNotification] = useState<string | null>(null);

  // Editable pet state for interactive feeding / level-up
  const [petStates, setPetStates] = useState<Record<string, { level: number; exp: number; maxExp: number }>>({
    fox: { level: 30, exp: 170, maxExp: 200 },
    duck: { level: 25, exp: 95, maxExp: 150 },
    dragon: { level: 45, exp: 320, maxExp: 500 },
  });

  const pet = PETS_ROSTER.find((p) => p.id === selectedPetId) || PETS_ROSTER[0];
  const currentProgress = petStates[pet.id] || { level: pet.level, exp: pet.exp, maxExp: pet.maxExp };

  const handleActionsLoaded = (actions: string[]) => {
    setAvailableActions(actions);
    if (actions.length > 0 && !actions.includes(currentAction)) {
      setCurrentAction(actions[0]);
    }
  };

  const handleFeed = () => {
    const cost = 3000;
    if (berries < cost) {
      alert('Không đủ Berries để cho ăn!');
      return;
    }

    setBerries((prev) => prev - cost);
    setPetStates((prev) => {
      const p = prev[pet.id];
      let newExp = p.exp + 50;
      let newLevel = p.level;
      let newMaxExp = p.maxExp;

      if (newExp >= newMaxExp) {
        newLevel += 1;
        newExp = newExp - newMaxExp;
        newMaxExp = Math.round(newMaxExp * 1.25);
        showFeedback(`🎉 ${pet.name} lên Level ${newLevel}!`);
      } else {
        showFeedback(`🍖 +50 EXP cho ${pet.name}!`);
      }

      return {
        ...prev,
        [pet.id]: { level: newLevel, exp: newExp, maxExp: newMaxExp }
      };
    });
  };

  const showFeedback = (msg: string) => {
    setFeedNotification(msg);
    setTimeout(() => setFeedNotification(null), 2500);
  };

  // Calculate segmented progress bar (4 segments like screenshot)
  const expPercent = Math.min(100, Math.round((currentProgress.exp / currentProgress.maxExp) * 100));
  const segments = [25, 50, 75, 100];

  return (
    <div className={`relative w-full min-h-[750px] lg:h-[820px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-gradient-to-br ${pet.bgGradient} flex flex-col justify-between p-4 sm:p-6 transition-all duration-700`}>
      
      {/* 3D CANVAS LỚP NỀN */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Pet3DViewer
          modelUrl={pet.modelUrl}
          scale={pet.scale}
          position={pet.position}
          currentAction={currentAction}
          onActionsLoaded={handleActionsLoaded}
          autoRotate={autoRotate}
        />
      </div>

      {/* Floating 3D Interaction Hints */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-2">
        <span className="text-[11px] font-medium tracking-wide bg-white/70 backdrop-blur-md px-3 py-1 rounded-full text-slate-500 shadow-sm border border-white/60">
          ✨ Kéo chuột / vuốt để xoay 360°
        </span>
      </div>

      {/* Pop-up Toast Feed Notification */}
      {feedNotification && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-xl">
          {feedNotification}
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP HEADER: NAVIGATION & CURRENCY */}
      {/* ============================================================ */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Energy badge & Tab group */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-sm border border-white">
            <Zap size={18} className="text-purple-600 fill-purple-600" />
            <span className="text-xl font-black text-purple-700">60</span>
          </div>

          <div className="flex bg-black/5 backdrop-blur-md p-1 rounded-2xl border border-white/40">
            {(['Stats', 'Moves', 'Candies'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1 text-xs font-bold rounded-xl transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Currencies */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Candy Currency */}
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white">
            <Candy size={16} className="text-red-500" />
            <span className="text-sm font-black text-slate-800">{candies}</span>
            <button 
              onClick={() => setCandies((c) => c + 5)}
              className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 text-xs"
            >
              +
            </button>
          </div>

          {/* Berry Currency */}
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white">
            <Cherry size={16} className="text-rose-600" />
            <span className="text-sm font-black text-slate-800">{berries.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MIDDLE ROW: STATS (LEFT) & ACTIONS (RIGHT) */}
      {/* ============================================================ */}
      <div className="relative z-20 flex-1 grid grid-cols-1 md:grid-cols-2 pointer-events-none items-center py-4">
        
        {/* LEFT COLUMN: COMBAT STATS */}
        <div className="pointer-events-auto w-full max-w-[240px] bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/80 shadow-lg shadow-purple-500/5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
              Chỉ số Pet
            </span>
            <SlidersHorizontal size={14} className="text-slate-400" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Heart size={15} className="text-red-500 fill-red-500/20" /> Máu (Life)
              </span>
              <span className="font-bold text-slate-800">{pet.stats.life}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Zap size={15} className="text-yellow-500 fill-yellow-500/20" /> Tốc độ (Speed)
              </span>
              <span className="font-bold text-slate-800">{pet.stats.speed}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Swords size={15} className="text-orange-500" /> Tấn công (Attack)
              </span>
              <span className="font-bold text-slate-800">{pet.stats.attack}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Shield size={15} className="text-blue-500" /> Phòng thủ (Defense)
              </span>
              <span className="font-bold text-slate-800">{pet.stats.defense}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Sparkles size={15} className="text-purple-500" /> S. Attack
              </span>
              <span className="font-bold text-slate-800">{pet.stats.sAttack}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Shield size={15} className="text-indigo-500" /> S. Defense
              </span>
              <span className="font-bold text-slate-800">{pet.stats.sDefense}</span>
            </div>
          </div>

          {/* 3D Action Animations Buttons */}
          {availableActions.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Động tác 3D:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableActions.map((act) => (
                  <button
                    key={act}
                    onClick={() => setCurrentAction(act)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all ${
                      currentAction === act
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto Rotate button */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RotateCw size={13} className={autoRotate ? 'animate-spin text-purple-600' : ''} />
            {autoRotate ? 'Dừng tự xoay' : 'Tự động xoay 360°'}
          </button>
        </div>

        {/* RIGHT COLUMN: PET IDENTITY & FEED ACTION */}
        <div className="pointer-events-auto flex flex-col items-end gap-4 ml-auto">
          
          {/* Pet Name, Rarity & Element badges */}
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1.5">
              {pet.elements.map((el) => (
                <span 
                  key={el.name}
                  className={`text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-lg shadow-sm flex items-center gap-1 ${el.color}`}
                >
                  <el.icon size={12} /> {el.name}
                </span>
              ))}
              <span className="text-[11px] font-black tracking-wider px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800">
                {pet.rarity}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black italic tracking-wide text-slate-900 drop-shadow-sm">
              {pet.name}
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              {pet.species}
            </p>

            {/* Stars */}
            <div className="flex items-center justify-end gap-1 pt-1">
              {Array.from({ length: 6 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`text-lg transition-transform hover:scale-125 ${
                    idx < pet.stars ? 'text-purple-600 drop-shadow-sm' : 'text-slate-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Level & Segmented EXP Progress */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-3xl border border-white/80 shadow-lg w-64 space-y-2 text-right">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-purple-700">
                {currentProgress.level} <span className="text-xs font-bold text-slate-400">Lv</span>
              </span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                +EXP: {currentProgress.exp} / {currentProgress.maxExp}
              </span>
            </div>

            {/* 4-Segmented Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 h-3">
              {segments.map((seg, i) => {
                const filled = expPercent >= seg;
                const partial = expPercent > seg - 25 && expPercent < seg;
                const partialWidth = partial ? `${((expPercent - (seg - 25)) / 25) * 100}%` : '0%';

                return (
                  <div key={i} className="bg-slate-200/90 rounded-md overflow-hidden relative">
                    {filled ? (
                      <div className="w-full h-full bg-gradient-to-r from-red-500 to-rose-500" />
                    ) : partial ? (
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-rose-500" 
                        style={{ width: partialWidth }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Giant FEED Button (Matches the reference screenshot) */}
          <button
            onClick={handleFeed}
            className="group relative px-8 py-4 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 active:scale-95 transition-all text-white font-black text-lg rounded-full shadow-xl shadow-red-500/30 flex items-center gap-3 cursor-pointer overflow-hidden border-2 border-white/40"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">🍖</span>
            <span>Feed 3000</span>
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM FOOTER: TEAM ROSTER & PET SWITCHER */}
      {/* ============================================================ */}
      <footer className="relative z-20 pointer-events-auto bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-white/80 shadow-lg flex items-center gap-3 overflow-x-auto">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider px-2 hidden sm:block">
          Đội hình:
        </div>

        {PETS_ROSTER.map((p) => {
          const isSelected = p.id === selectedPetId;
          const currentPetLvl = petStates[p.id]?.level || p.level;

          return (
            <button
              key={p.id}
              onClick={() => setSelectedPetId(p.id)}
              className={`relative min-w-[76px] sm:min-w-[88px] h-20 rounded-2xl border-2 transition-all p-2 flex flex-col items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-purple-600 bg-purple-50/80 shadow-md scale-105 ring-2 ring-purple-400/30'
                  : 'border-slate-200/90 bg-white/90 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Pet Icon */}
              <span className="text-2xl sm:text-3xl">{p.iconEmoji}</span>

              {/* Level indicator */}
              <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600">
                <span className="text-amber-500">★{p.stars}</span>
                <span className="px-1.5 py-0.2 bg-slate-100 rounded-md">Lv.{currentPetLvl}</span>
              </div>

              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-black">
                  ✓
                </div>
              )}
            </button>
          );
        })}

        {/* Add Pet Slot / Bench placeholder */}
        <div className="min-w-[76px] sm:min-w-[88px] h-20 rounded-2xl border-2 border-dashed border-slate-300/80 bg-slate-50/50 flex flex-col items-center justify-center gap-1 text-slate-400">
          <Plus size={18} />
          <span className="text-[10px] font-bold">Dự bị</span>
        </div>
      </footer>
    </div>
  );
}
