'use client';

import { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Calendar, 
  Flame, 
  Send, 
  MessageSquareText,
  TrendingUp,
  Award
} from 'lucide-react';

interface TaskActivityLogProps {
  tasks: any[];
}

export default function TaskActivityLog({ tasks }: TaskActivityLogProps) {
  const [quickNote, setQuickNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([
    'Tập trung hoàn thành bài học N8N trước 20h tối nay.',
    'Xem lại tài liệu Supabase RLS policies.'
  ]);

  const completedCount = tasks.filter(t => t.status === 'Hoàn thành').length;
  const totalCount = tasks.length || 1;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setNotesList([quickNote.trim(), ...notesList]);
    setQuickNote('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Productivity Stats & Streak */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Hiệu suất làm việc</h3>
              <p className="text-[11px] text-gray-500">Chuỗi ngày tập trung</p>
            </div>
          </div>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-full text-xs font-bold">
            <Award size={14} />
            3 Ngày liên tiếp
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Tỷ lệ hoàn thành hôm nay</span>
            <span className="text-sm font-bold text-emerald-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${completionRate}%` }} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/80">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Công việc xong</span>
              <p className="text-lg font-extrabold text-gray-900 mt-0.5">{completedCount} / {tasks.length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/80">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Đánh giá</span>
              <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                Tiến độ tốt
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Notes & Focus Memo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquareText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Ghi chú & Mục tiêu nhanh</h3>
              <p className="text-[11px] text-gray-500">Lưu ý quan trọng cho hôm nay</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddNote} className="relative">
          <input
            type="text"
            className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Viết ghi chú ngắn..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Send size={12} />
          </button>
        </form>

        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1 mt-1">
          {notesList.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700">
              <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
