'use client';
import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag, 
  Check, 
  X, 
  Trash2,
  Search,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  Users,
  Timer
} from 'lucide-react';
import AIScheduleModal from './AIScheduleModal';

import { useCalendarState } from '@/hooks/useCalendarState';

export default function DesktopCalendar({ state }: { state: ReturnType<typeof useCalendarState> }) {
  const {
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
    getEventStyle, redLineTop, weekDays
  } = state;

  const { CATEGORY_COLORS } = require('@/hooks/useCalendarState');

  const HOURS = require('@/hooks/useCalendarState').HOURS;

  const now = new Date();

  return (
    <div 
      className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 rounded-xl relative overflow-hidden min-h-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/shinchan_bg.jpg')" }}
    >

      
      {/* Decorative background glows */}
      
      {/* ========================================================= */}


      {/* ========================================================= */}
      {/* MAIN CALENDAR BOARD */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative z-10 p-2 sm:p-4 lg:p-6">
        
        {/* TOP TOOLBAR: TODAY, ARROWS, MONTH, VIEW SWITCH */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 relative z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight mr-2 flex items-center gap-3">
              {headerDateString}
            </h2>

            <div className="flex items-center bg-gray-50/80 backdrop-blur-md rounded-2xl p-1 border border-gray-100">
              <button 
                onClick={handlePrev}
                className="p-2 hover:bg-white rounded-xl text-gray-500 hover:text-gray-800 transition-colors cursor-pointer hover:shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-1.5 rounded-xl text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Hôm nay
              </button>
              <button 
                onClick={handleNext}
                className="p-2 hover:bg-white rounded-xl text-gray-500 hover:text-gray-800 transition-colors cursor-pointer hover:shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>


          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Jake Create Event Button */}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  date: formatDateKey(currentDate),
                });
                setIsModalOpen(true);
              }}
              className="transition-transform hover:scale-110 hover:-rotate-2 active:scale-95 cursor-pointer flex items-center mr-1 sm:mr-2 drop-shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/jake_create_event_clean.png" 
                alt="Tạo sự kiện" 
                className="w-[90px] sm:w-[110px] h-auto" 
              />
            </button>

            {/* AI Quick Button (Moved to Right) */}
            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF1EB] hover:bg-[#FFE4D6] text-[#FF7D3B] text-[13px] font-bold transition-all cursor-pointer group shadow-sm border border-[#FFE4D6]"
            >
              <Sparkles size={14} className="text-[#FF7D3B] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">AI Lên Lịch</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* View mode toggle: Tuần / Tháng / Ngày */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              {(['day', 'week', 'month'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all duration-200 cursor-pointer ${
                    viewMode === m
                      ? 'bg-white text-[#FF7D3B] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {m === 'day' ? 'Ngày' : m === 'week' ? 'Tuần' : 'Tháng'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WEEK VIEW TIME GRID */}
        {viewMode === 'week' && (
          <div className="flex-1 flex flex-col mt-2 overflow-y-auto min-h-0 bg-white/10 rounded-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] custom-scrollbar">
            {/* Header row: 7 Days */}
            <div className="grid grid-cols-8 border-b border-white/20 bg-white/30 sticky top-0 z-30">
              <div className="p-4 text-[10px] font-black text-gray-400 text-center border-r border-gray-100/60 flex items-end justify-center pb-2 uppercase tracking-widest">
                GMT+7
              </div>
              {weekDays.map((d, i) => {
                const today = isToday(d);
                const dayLabels = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                return (
                  <div 
                    key={i} 
                    className="p-3 sm:p-4 text-center border-r border-gray-100/60 last:border-r-0 transition-colors"
                  >
                    <span className={`text-[11px] font-extrabold block uppercase tracking-wider ${today ? 'text-[#FF7D3B]' : 'text-gray-500'}`}>
                      {dayLabels[d.getDay()]}
                    </span>
                    <div className="mt-1 flex justify-center">
                      <span 
                        className={`inline-flex w-9 h-9 items-center justify-center rounded-full text-lg font-black transition-all ${
                          today ? 'bg-[#FF7D3B] text-white shadow-md' : 'text-gray-800'
                        }`}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slot Rows (07:00 - 22:00) */}
            <div className="relative flex-1 grid grid-cols-8">
              {/* Left Column: Hours */}
              <div className="border-r border-white/20 bg-white/10 relative z-20">
                {HOURS.map((h) => (
                  <div key={h} className="h-16 pr-3 pt-1 text-right text-[11px] font-bold text-gray-800 relative">
                    <span className="relative z-10 bg-white/60 px-1 rounded -top-3">{h < 10 ? `0${h}:00` : `${h}:00`}</span>
                  </div>
                ))}
              </div>

              {/* Orange Line for Current Time if within view hours */}
              {redLineTop >= 0 && redLineTop <= HOURS.length * 64 && (
                <div 
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                  style={{ top: `${redLineTop}px` }}
                >
                  <div className="bg-[#FF7D3B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full -ml-[4px] relative z-20 shadow-sm whitespace-nowrap">
                    {now.getHours() < 10 ? `0${now.getHours()}` : now.getHours()}:{now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()}
                  </div>
                  <div className="flex-1 h-[1.5px] bg-[#FF7D3B]" />
                </div>
              )}

              {/* 7 Day Columns with Events */}
              {weekDays.map((dayObj, colIdx) => {
                const dateKey = formatDateKey(dayObj);
                const dayEvents = events.filter(
                  (e) => e.date === dateKey && filterCategories[e.category]
                );

                return (
                  <div
                    key={colIdx}
                    className="relative border-r border-white/20 last:border-r-0 group bg-transparent hover:bg-white/10 transition-colors"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setFormData({
                          ...formData,
                          date: dateKey,
                        });
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    {/* Background hour grid lines */}
                    {HOURS.map((h) => (
                      <div 
                        key={h} 
                        className="h-16 border-b border-white/20 hover:bg-white/20 transition-colors cursor-pointer relative"
                        onClick={() => {
                          const formattedH = h < 10 ? `0${h}:00` : `${h}:00`;
                          const formattedEndH = h + 1 < 10 ? `0${h + 1}:00` : `${h + 1}:00`;
                          setFormData({
                            title: '',
                            date: dateKey,
                            startTime: formattedH,
                            endTime: formattedEndH,
                            category: 'study',
                            description: '',
                          });
                          setIsModalOpen(true);
                        }}
                      />
                    ))}

                    {/* Render Events */}
                    {dayEvents.map((evt) => {
                      const catStyle = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.work;
                      const style = getEventStyle(evt);
                      const Icon = catStyle.icon;

                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          style={style}
                          className={`absolute left-[4px] right-[4px] rounded-r-xl rounded-l-[4px] p-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md z-10 group/event ${catStyle.bg} border-l-[4px] ${catStyle.border}`}
                        >
                          <div className="flex flex-col h-full ml-1">
                            <div className="flex items-start justify-between">
                              <span className={`font-bold text-[11px] leading-tight line-clamp-2 pr-4 ${catStyle.text} flex items-start gap-1`}>
                                <Icon size={12} className="shrink-0 mt-0.5" />
                                <span>{evt.title}</span>
                              </span>
                              <button className={`absolute right-1 top-1.5 opacity-0 group-hover/event:opacity-100 transition-opacity ${catStyle.text}`}>
                                <MoreHorizontal size={14} />
                              </button>
                            </div>
                            <span className={`text-[9.5px] font-semibold mt-auto opacity-75 ${catStyle.text} flex items-center gap-1`}>
                              <Clock size={10} /> {evt.startTime} - {evt.endTime}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="flex-1 flex flex-col mt-2 bg-white/10 rounded-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-y-auto min-h-0 custom-scrollbar">
            <div className="grid grid-cols-7 bg-white/30 border-b border-white/20 text-center py-3 text-[11px] font-black text-gray-800 uppercase tracking-wider">
              <span>Thứ 2</span><span>Thứ 3</span><span>Thứ 4</span><span>Thứ 5</span><span>Thứ 6</span><span>Thứ 7</span><span>Chủ nhật</span>
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-gray-100/60">
              {Array.from({ length: 35 }, (_, idx) => {
                const dayNum = (idx % 31) + 1;
                return (
                  <div key={idx} className="min-h-[120px] p-2 hover:bg-blue-50/20 transition-colors cursor-pointer group">
                    <span className="inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">{dayNum}</span>
                    <div className="mt-1.5 space-y-1.5">
                      {events.slice(0, 3).map((e) => {
                        const catStyle = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.work;
                        return (
                          <div key={e.id} className={`text-[10px] truncate px-2 py-1 rounded-lg font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                            {e.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="flex-1 mt-2 bg-white/20 rounded-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 overflow-y-auto min-h-0 space-y-4 custom-scrollbar">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4">
              Lịch trình ngày: <span className="text-blue-600">{formatDateKey(currentDate)}</span>
            </h3>
            <div className="space-y-3">
              {events
                .filter((e) => e.date === formatDateKey(currentDate))
                .map((e) => {
                  const catStyle = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.work;
                  return (
                    <div key={e.id} className={`relative flex items-center justify-between p-4 rounded-2xl border ${catStyle.border} ${catStyle.bg} shadow-sm group overflow-hidden`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${catStyle.gradient}`}></div>
                      <div className="ml-3">
                        <h4 className={`font-bold text-sm ${catStyle.text}`}>{e.title}</h4>
                        <p className={`text-xs flex items-center gap-1 mt-1 opacity-80 ${catStyle.text}`}>
                          <Clock size={14} /> {e.startTime} - {e.endTime}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteEvent(e.id)} className="p-2.5 text-red-500 hover:bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-105">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              {events.filter((e) => e.date === formatDateKey(currentDate)).length === 0 && (
                <div className="text-center py-10 text-gray-400 font-medium text-sm">
                  Không có sự kiện nào trong ngày này.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* POPUP MODAL: CREATE NEW EVENT (GOOGLE CALENDAR STYLE) */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon size={18} className="text-blue-600" />
                <span>Thêm sự kiện mới</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Tiêu đề sự kiện</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ôn tập thuật toán, Họp dự án..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Ngày</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Phân loại</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-blue-500 bg-white"
                  >
                    <option value="study">Học tập</option>
                    <option value="work">Công việc</option>
                    <option value="pomodoro">Pomodoro Focus</option>
                    <option value="personal">Cá nhân</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  placeholder="Nội dung chi tiết..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Lưu sự kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP: VIEW EVENT DETAIL */}
      {/* ========================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CATEGORY_COLORS[selectedEvent.category].bg} ${CATEGORY_COLORS[selectedEvent.category].text}`}>
                  {CATEGORY_COLORS[selectedEvent.category].label}
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-1">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-gray-400" />
                <span>{selectedEvent.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>
              {selectedEvent.description && (
                <p className="pt-2 text-gray-500 border-t border-gray-200/50 italic">
                  "{selectedEvent.description}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Xóa sự kiện</span>
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Schedule Generator Modal */}
      <AIScheduleModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        baseDate={currentDate}
        onApplyEvents={handleApplyAIEvents}
      />


    </div>
  );
}
