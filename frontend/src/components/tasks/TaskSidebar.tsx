'use client';

import { Plus, Clock } from 'lucide-react';
import DonutChartCard from '../shared/DonutChartCard';

const mockKanban = {
  todo: [
    { id: 1, title: 'Đi chợ mua thực phẩm' },
    { id: 2, title: 'Đọc sách 30 phút' },
    { id: 3, title: 'Đặt vé máy bay về quê' },
  ],
  inProgress: [
    { id: 4, title: 'Hoàn thành báo cáo dự án Q2' },
    { id: 5, title: 'Học khóa học online' },
    { id: 6, title: 'Chuẩn bị bài thuyết trình' },
  ],
  done: [
    { id: 7, title: 'Tập gym buổi sáng' },
    { id: 8, title: 'Gọi điện cho khách hàng' },
    { id: 9, title: 'Thanh toán hóa đơn điện' },
  ]
};

const mockUpcoming = [
  { id: 1, title: 'Hoàn thành báo cáo dự án Q2', date: '26/06/2026', priority: 'Cao', color: 'text-danger' },
  { id: 2, title: 'Học khóa học online', date: '30/06/2026', priority: 'Trung bình', color: 'text-warning' },
  { id: 3, title: 'Chuẩn bị bài thuyết trình', date: '29/06/2026', priority: 'Cao', color: 'text-danger' },
];

const mockTaskStats = [
  { name: 'Đang làm', value: 29, amount: '7', color: '#3b82f6' },
  { name: 'Hoàn thành', value: 42, amount: '10', color: '#10b981' },
  { name: 'Chưa làm', value: 21, amount: '5', color: '#9ca3af' },
  { name: 'Quá hạn', value: 8, amount: '2', color: '#ef4444' },
];

export default function TaskSidebar() {
  const chartCenter = (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-gray-900">24</span>
      <span className="text-[10px] text-gray-500">Tổng task</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Kanban Board */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-md font-bold text-gray-900">Tiến độ công việc</h3>
          <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Xem chi tiết &gt;</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TODO Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-gray-100">
              <span className="text-sm font-bold text-gray-500">Chưa làm</span>
              <span className="text-xs text-gray-400">10</span>
            </div>
            <div className="flex flex-col gap-2">
              {mockKanban.todo.map(task => (
                <div key={task.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-700 flex items-start gap-2 hover:border-primary/30 cursor-pointer transition-colors">
                  <div className="w-1 h-4 bg-gray-300 rounded-full shrink-0 mt-0.5"></div>
                  <span className="line-clamp-2">{task.title}</span>
                </div>
              ))}
            </div>
            <button className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-primary py-2 border border-dashed border-gray-200 rounded-lg hover:border-primary/30 transition-colors">
              <Plus size={14} /> Thêm task
            </button>
          </div>
          
          {/* IN PROGRESS Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-primary/20">
              <span className="text-sm font-bold text-primary">Đang làm</span>
              <span className="text-xs text-primary/70">7</span>
            </div>
            <div className="flex flex-col gap-2">
              {mockKanban.inProgress.map(task => (
                <div key={task.id} className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-xs text-gray-800 flex items-start gap-2 hover:border-primary/30 cursor-pointer transition-colors">
                  <div className="w-1 h-4 bg-primary/40 rounded-full shrink-0 mt-0.5"></div>
                  <span className="line-clamp-2">{task.title}</span>
                </div>
              ))}
            </div>
            <button className="flex items-center justify-center gap-1 text-xs text-primary hover:text-primary/80 py-2 border border-dashed border-primary/20 rounded-lg hover:border-primary/40 transition-colors bg-primary/5">
              <Plus size={14} /> Thêm task
            </button>
          </div>

          {/* DONE Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-success/20">
              <span className="text-sm font-bold text-success">Hoàn thành</span>
              <span className="text-xs text-success/70">10</span>
            </div>
            <div className="flex flex-col gap-2">
              {mockKanban.done.map(task => (
                <div key={task.id} className="bg-success/5 p-3 rounded-lg border border-success/10 text-xs text-gray-600 flex items-start gap-2 hover:border-success/30 cursor-pointer transition-colors">
                  <div className="w-1 h-4 bg-success/40 rounded-full shrink-0 mt-0.5"></div>
                  <span className="line-clamp-2 line-through opacity-70">{task.title}</span>
                </div>
              ))}
            </div>
            <button className="flex items-center justify-center gap-1 text-xs text-success hover:text-success/80 py-2 border border-dashed border-success/20 rounded-lg hover:border-success/40 transition-colors bg-success/5">
              <Plus size={14} /> Thêm task
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
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

        {/* Progress Overview Donut */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="h-full flex flex-col p-2">
            <DonutChartCard 
              title="Tổng quan tiến độ"
              data={mockTaskStats}
              centerElement={chartCenter}
              showLegendAmounts={true}
            />
            <div className="px-6 pb-6 pt-2">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Hoàn thành mục tiêu tháng 06</span>
                <span className="font-bold text-gray-900">67%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
