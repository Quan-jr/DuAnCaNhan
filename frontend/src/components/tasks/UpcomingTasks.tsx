'use client';

import { Clock } from 'lucide-react';

const mockUpcoming = [
  { id: 1, title: 'Hoàn thành báo cáo dự án Q2', date: '26/06/2026', priority: 'Cao', color: 'text-danger' },
  { id: 2, title: 'Học khóa học online', date: '30/06/2026', priority: 'Trung bình', color: 'text-warning' },
  { id: 3, title: 'Chuẩn bị bài thuyết trình', date: '29/06/2026', priority: 'Cao', color: 'text-danger' },
];

export default function UpcomingTasks() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-bold text-gray-900">Sắp đến hạn</h3>
        <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Xem tất cả &gt;</span>
      </div>
      
      <div className="flex flex-col gap-5">
        {mockUpcoming.map(task => (
          <div key={task.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 group-hover:scale-110 transition-transform">
                <Clock size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{task.title}</h4>
                <span className="text-[10px] text-gray-500 mt-0.5 block">{task.date}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold bg-gray-50 px-2 py-1 rounded-md border border-gray-100 shrink-0 ${task.color}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
