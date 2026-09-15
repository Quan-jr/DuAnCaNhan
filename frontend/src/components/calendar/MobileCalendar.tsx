'use client';

import React, { useState } from 'react';
import { useCalendarState } from '@/hooks/useCalendarState';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock } from 'lucide-react';
import EventBottomSheet from './EventBottomSheet';

export default function MobileCalendar({ state }: { state: ReturnType<typeof useCalendarState> }) {
  const {
    currentDate, setCurrentDate,
    events,
    handlePrev, handleNext, handleToday,
    formatDateKey,
    isModalOpen, setIsModalOpen,
    formData, setFormData,
    handleCreateEvent
  } = state;

  const { CATEGORY_COLORS } = require('@/hooks/useCalendarState');

  // Filter events for current day
  const currentDayEvents = events.filter(e => e.date === formatDateKey(currentDate))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const weekDays = () => {
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
  const currentWeek = weekDays();

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FB] h-full relative">
      {/* Date Selector Header */}
      <div className="px-4 py-4 bg-white shadow-sm z-10 sticky top-0 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <button 
            onClick={handleToday}
            className="text-sm font-semibold text-[#FF7D3B] bg-[#FFF1EB] px-3 py-1.5 rounded-full"
          >
            Hôm nay
          </button>
        </div>

        {/* Weekly strip */}
        <div className="flex justify-between items-center">
          <button onClick={handlePrev} className="p-2 text-gray-400 hover:text-gray-900"><ChevronLeft size={20} /></button>
          
          <div className="flex flex-1 justify-between px-2">
            {currentWeek.map((d, i) => {
              const isSelected = d.toDateString() === currentDate.toDateString();
              return (
                <div 
                  key={i} 
                  onClick={() => setCurrentDate(new Date(d))}
                  className={`flex flex-col items-center justify-center w-11 h-14 rounded-2xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#FF7D3B] text-white shadow-md' : 'text-gray-500'
                  }`}
                >
                  <span className={`text-[10px] font-medium uppercase ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    {dayLabels[d.getDay()]}
                  </span>
                  <span className="text-[15px] font-bold mt-0.5">{d.getDate()}</span>
                </div>
              );
            })}
          </div>

          <button onClick={handleNext} className="p-2 text-gray-400 hover:text-gray-900"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32 custom-scrollbar">
        {currentDayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Clock size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">Không có sự kiện nào hôm nay</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-[4.5rem] pl-6 space-y-6">
            {currentDayEvents.map(evt => {
              const category = CATEGORY_COLORS[evt.category];
              const Icon = category?.icon || Clock;
              return (
                <div key={evt.id} className="relative">
                  {/* Time label on the left */}
                  <div className="absolute -left-[5.5rem] top-1/2 -translate-y-1/2 w-16 text-right">
                    <span className="text-xs font-bold text-gray-700 block">{evt.startTime}</span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {parseInt(evt.startTime) >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className={`absolute -left-[1.65rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white ${category?.bg.replace('bg-', 'bg-')} bg-white shadow-sm ring-1 ring-gray-100`}>
                    <div className={`w-full h-full rounded-full ${category?.dot}`} />
                  </div>

                  {/* Event Card */}
                  <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 ${category?.border} active:scale-[0.98] transition-transform`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${category?.bg} ${category?.text} shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-bold text-[15px] text-gray-900 truncate">{evt.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          {evt.startTime} - {evt.endTime}
                        </p>
                        {evt.description && (
                          <p className="text-xs text-gray-400 mt-2 truncate max-w-full">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB - Create Event */}
      <button
        onClick={() => {
          setFormData({
            ...formData,
            date: formatDateKey(currentDate),
          });
          setIsModalOpen(true);
        }}
        className="absolute bottom-6 right-4 w-14 h-14 bg-[#FF7D3B] hover:bg-[#E86A2D] text-white rounded-2xl shadow-lg flex items-center justify-center transition-transform active:scale-95 z-20"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Bottom Sheet Modal for Create/Edit */}
      <EventBottomSheet 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        state={state}
      />
    </div>
  );
}
