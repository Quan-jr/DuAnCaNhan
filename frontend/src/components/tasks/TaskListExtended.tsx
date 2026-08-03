'use client';

import { useState } from 'react';
import { X, MoreVertical, Calendar, CheckSquare, RefreshCw, CheckCircle, FileText, ShoppingCart, BookOpen, Activity, Book, Monitor, Plane, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, any> = {
  'file-text': FileText,
  'shopping-cart': ShoppingCart,
  'book-open': BookOpen,
  'activity': Activity,
  'book': Book,
  'monitor': Monitor,
  'plane': Plane,
  'calendar': Calendar,
  'clock': Clock,
};

interface TaskListExtendedProps {
  tasks: any[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
}

export default function TaskListExtended({ tasks, loading, fetchTasks }: TaskListExtendedProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null);

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

  const handleUpdateStatus = async (e: React.MouseEvent, task: any, newStatusId: number) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('task_list')
        .update({ id__status: newStatusId })
        .eq('id', task.id);
      
      if (error) throw error;
      fetchTasks();
    } catch (err: any) {
      alert(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden min-h-[400px] justify-center items-center">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <span className="text-sm text-gray-500 mt-2 font-medium">Đang tải danh sách công việc...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Danh sách công việc</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="overflow-y-auto">
        <div className="flex flex-col">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <CheckSquare size={36} className="text-gray-300" />
              <span className="text-sm font-medium">Chưa có công việc nào. Hãy thêm mới!</span>
            </div>
          ) : (
            tasks.map((task) => {
              const Icon = iconMap[task.icon || 'file-text'] || FileText;
              
              return (
                <div 
                  key={task.id}
                  className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="self-center shrink-0 w-[85px] flex justify-center">
                    {task.status === 'Chưa làm' && (
                      <button 
                        onClick={(e) => handleUpdateStatus(e, task, 2)}
                        className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 w-full transition-colors"
                      >
                        Bắt đầu làm
                      </button>
                    )}
                    {task.status === 'Đang làm' && (
                      <button 
                        onClick={(e) => handleUpdateStatus(e, task, 3)}
                        className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 w-full transition-colors"
                      >
                        Hoàn thành
                      </button>
                    )}
                    {task.status === 'Hoàn thành' && (
                      <div 
                        className="w-5 h-5 rounded border border-primary bg-primary flex items-center justify-center text-white cursor-pointer"
                        onClick={(e) => handleUpdateStatus(e, task, 1)} // optional: allow unchecking back to 'Chưa làm'
                      >
                        <CheckSquare size={14} className="text-white" />
                      </div>
                    )}
                    {['Tạm hoãn', 'Hủy bỏ', 'Quá hạn'].includes(task.status) && (
                      <div className="w-6 h-6 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center cursor-default">
                        <X size={14} className="text-gray-400" />
                      </div>
                    )}
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
                      {task.image_url && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shrink-0 select-none">
                          <img src={task.image_url} alt="attachment" className="w-full h-full object-cover" />
                        </div>
                      )}
                      
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
            })
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-auto">
        <span>Hiển thị 1 đến {tasks.length} của {tasks.length} công việc</span>
        <div className="flex gap-1">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50">&lt;</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white shadow-sm">1</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50">&gt;</button>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedTask && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              onClick={() => setSelectedTask(null)}
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-3 mt-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTask.color || 'bg-gray-100 text-gray-500'}`}>
                {(() => {
                  const Icon = iconMap[selectedTask.icon || 'file-text'] || FileText;
                  return <Icon size={20} />;
                })()}
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ml-2 ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-gray-900 leading-snug">{selectedTask.title}</h3>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Calendar size={14} />
                <span>Hạn chót: {selectedTask.date}</span>
              </div>
            </div>

            {selectedTask.image_url && (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 h-40 w-full shrink-0 select-none">
                <img src={selectedTask.image_url} alt="Task image" className="w-full h-full object-cover" />
              </div>
            )}

            <hr className="border-gray-100" />

            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả chi tiết</h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100/50">
                {selectedTask.description || "Không có mô tả cho công việc này."}
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              <button 
                className="flex-1 py-2 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                onClick={() => setSelectedTask(null)}
              >
                Đóng
              </button>
              <button 
                className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                onClick={() => {
                  alert('Tính năng chỉnh sửa đang được phát triển!');
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
