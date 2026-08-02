'use client';

import { MoreVertical, Calendar, CheckSquare, RefreshCw, CheckCircle, FileText, ShoppingCart, BookOpen, Activity, Book, Monitor, Plane } from 'lucide-react';
import { mockTasks } from '@/lib/mockData';

const iconMap: Record<string, any> = {
  'file-text': FileText,
  'shopping-cart': ShoppingCart,
  'book-open': BookOpen,
  'activity': Activity,
  'book': Book,
  'monitor': Monitor,
  'plane': Plane,
};

export default function TaskListExtended() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành': return 'bg-success/10 text-success border-success/20';
      case 'Đang làm': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Cao': return 'bg-danger/10 text-danger border-danger/20';
      case 'Trung bình': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-success/10 text-success border-success/20';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Danh sách công việc</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {mockTasks.map((task) => {
            const Icon = iconMap[task.icon || 'file-text'] || FileText;
            
            return (
              <div 
                key={task.id}
                className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <div className="pt-1 self-start">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                    task.checked 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-gray-300 hover:border-primary bg-white'
                  }`}>
                    {task.checked && <CheckSquare size={14} className="text-white" />}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${task.color || 'bg-gray-100 text-gray-500'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${task.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto shrink-0 pl-14 sm:pl-0">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs w-24">
                      <Calendar size={14} />
                      <span>{task.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-[160px] justify-end">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
