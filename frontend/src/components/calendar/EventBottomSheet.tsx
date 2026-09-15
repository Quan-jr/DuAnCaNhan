'use client';
import React, { useEffect, useState } from 'react';
import { useCalendarState } from '@/hooks/useCalendarState';
import { X, Check } from 'lucide-react';

export default function EventBottomSheet({ 
  isOpen, 
  onClose, 
  state 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  state: ReturnType<typeof useCalendarState>;
}) {
  const { formData, setFormData, handleCreateEvent } = state;
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Bottom Sheet Content */}
      <div 
        className={`relative w-full bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Handle bar */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="px-6 pb-6 pt-2 overflow-y-auto max-h-[calc(90vh-20px)] custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Tạo sự kiện mới</h3>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-95 transition-transform">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sự kiện</label>
              <input
                type="text"
                required
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF7D3B]/20 focus:border-[#FF7D3B]"
                placeholder="Ví dụ: Họp nhóm dự án..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày</label>
                <input
                  type="date"
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF7D3B]/20 focus:border-[#FF7D3B]"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phân loại</label>
                <select
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF7D3B]/20 focus:border-[#FF7D3B]"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <option value="work">Công việc</option>
                  <option value="study">Học tập</option>
                  <option value="personal">Cá nhân</option>
                  <option value="pomodoro">Pomodoro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bắt đầu</label>
                <input
                  type="time"
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF7D3B]/20 focus:border-[#FF7D3B]"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kết thúc</label>
                <input
                  type="time"
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF7D3B]/20 focus:border-[#FF7D3B]"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả chi tiết (Tuỳ chọn)</label>
              <textarea
                rows={3}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF7D3B]/20 focus:border-[#FF7D3B] resize-none"
                placeholder="Thêm mô tả hoặc ghi chú..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full h-[52px] bg-[#FF7D3B] hover:bg-[#E86A2D] text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 mt-4 active:scale-[0.98] transition-transform"
            >
              <Check size={20} strokeWidth={3} />
              Tạo sự kiện
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
