'use client';

import { Check, Clock, AlertCircle } from 'lucide-react';
import { mockTasks } from '@/lib/mockData';

export default function TaskList() {
  return (
    <div className="glass-card p-6 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Danh sách công việc</h2>
        <button className="text-sm text-primary font-medium hover:underline">Xem tất cả</button>
      </div>
      
      <div className="flex flex-col gap-3">
        {mockTasks.map((task) => (
          <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100 gap-3 sm:gap-0">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-5 h-5 mt-0.5 sm:mt-0 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                task.checked ? 'bg-primary border-primary text-white' : 'border-gray-300 group-hover:border-primary'
              }`}>
                {task.checked && <Check size={14} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${task.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {task.title}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Clock size={12} /> {task.date}
                </span>
              </div>
            </div>
            <div className="flex gap-2 ml-8 sm:ml-0">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                task.status === 'Đang làm' ? 'bg-info-light text-info' : 
                task.status === 'Hoàn thành' ? 'bg-success-light text-success' : 'bg-gray-100 text-gray-600'
              }`}>
                {task.status}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                task.priority === 'Cao' ? 'bg-danger-light text-danger' : 
                task.priority === 'Trung bình' ? 'bg-warning-light text-warning' : 'bg-success-light text-success'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
