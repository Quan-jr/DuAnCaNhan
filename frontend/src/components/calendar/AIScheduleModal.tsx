'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Calendar, 
  Clock, 
  Check, 
  Loader2, 
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';
import { CalendarEvent } from './GoogleCalendarView';

interface AIScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseDate: Date;
  onApplyEvents: (events: CalendarEvent[]) => void;
}

const SAMPLE_PROMPTS = [
  '🚀 Lên lịch học lập trình Next.js và Pomodoro 5 ngày trong tuần',
  '🎯 Ôn thi IELTS: Sáng 8h30-10h30, Tối 19h-20h30',
  '💼 Làm việc dự án từ 14h đến 17h và tập gym lúc 18h',
  '🌿 Lịch học tập trung buổi sáng, chiều họp dự án, tối giải trí'
];

export default function AIScheduleModal({
  isOpen,
  onClose,
  baseDate,
  onApplyEvents,
}: AIScheduleModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<CalendarEvent[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (textToUse?: string) => {
    const text = textToUse || prompt;
    if (!text.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setGeneratedEvents([]);

    try {
      const year = baseDate.getFullYear();
      const month = String(baseDate.getMonth() + 1).padStart(2, '0');
      const day = String(baseDate.getDate()).padStart(2, '0');
      const baseDateStr = `${year}-${month}-${day}`;

      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, baseDate: baseDateStr }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi xử lý');

      if (data.events && Array.isArray(data.events)) {
        const parsedWithIds: CalendarEvent[] = data.events.map((e: any, idx: number) => ({
          ...e,
          id: `ai-${Date.now()}-${idx}`,
        }));
        setGeneratedEvents(parsedWithIds);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo lịch trình, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedEvents.length === 0) return;
    onApplyEvents(generatedEvents);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">
                AI Tạo Thời Gian Biểu Tự Động
              </h3>
              <p className="text-xs text-gray-500">
                Chỉ cần mô tả mục tiêu hoặc lịch sinh hoạt, AI sẽ tự động phân bổ vào lịch.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* Prompt Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              <span>Nhập yêu cầu của bạn (Prompt):</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Tuần này tôi muốn học Next.js từ 8h đến 10h sáng mỗi ngày, chiều làm việc dự án từ 14h đến 17h, tối 18h tập gym..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-purple-500 focus:border-purple-500 shadow-inner resize-none pr-12"
              />
              <button
                type="button"
                disabled={loading || !prompt.trim()}
                onClick={() => handleGenerate()}
                className="absolute right-3 bottom-3.5 p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-all shadow-md cursor-pointer"
                title="Gửi cho AI"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Gợi ý mẫu (Nhấn để tạo nhanh):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(p);
                    handleGenerate(p);
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-gray-200/80 text-gray-600 transition-all text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-purple-600 animate-pulse">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-xs font-bold tracking-wide">
                AI đang tính toán và sắp xếp thời gian biểu tối ưu...
              </span>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Generated Events Preview */}
          {generatedEvents.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" />
                  <span>AI đã xếp {generatedEvents.length} sự kiện cho bạn:</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Xem trước</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {generatedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: evt.color }} />
                      <div>
                        <span className="font-bold text-gray-800 block">{evt.title}</span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Calendar size={11} /> {evt.date} • <Clock size={11} /> {evt.startTime} - {evt.endTime}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600">
                      {evt.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            Đóng
          </button>

          {generatedEvents.length > 0 && (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>Áp dụng vào Lịch Biểu</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
