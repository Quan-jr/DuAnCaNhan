'use client';

import { Clock } from 'lucide-react';

import { useState } from 'react';

interface UpcomingTasksProps {
  tasks: any[];
}

export default function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filter for pending tasks and sort them by date (just taking them as they are for now, or sort if date is available)
  const pendingTasks = tasks.filter(t => t.status !== 'Hoàn thành' && t.status !== 'Hủy bỏ');
  
  const totalPages = Math.ceil(pendingTasks.length / itemsPerPage);
  
  const currentItems = pendingTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-bold text-gray-900">Sắp đến hạn</h3>
        <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Xem tất cả &gt;</span>
      </div>
      
      <div className="flex flex-col gap-5 flex-1 justify-center">
        {currentItems.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-400 italic">Trống</div>
        ) : (
          currentItems.map(task => (
            <div key={task.id} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${task.color?.replace('text-', 'bg-').replace('-600', '-100') || 'bg-gray-100'} ${task.color || 'text-gray-500'}`}>
                  <Clock size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{task.title}</h4>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">{task.date}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold bg-gray-50 px-2 py-1 rounded-md border border-gray-100 shrink-0 ml-2 ${task.color}`}>
                {task.priority}
              </span>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-xs"
          >
            &lt;
          </button>
          <span className="text-xs text-gray-600 font-medium">{currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-xs"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
