import { useState } from 'react';

interface TaskKanbanProps {
  tasks: any[];
}

export default function TaskKanban({ tasks }: TaskKanbanProps) {
  const today = new Date();
  
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const currentMonday = getMonday(today);

  // Calculate week number
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };
  const weekNumber = getWeekNumber(today);

  // Format date
  const dayStr = String(today.getDate()).padStart(2, '0');
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const yearStr = today.getFullYear();
  const formattedDate = `${dayStr}/${monthStr}/${yearStr}`;

  const currentWeekTasks = tasks.filter(t => {
    if (!t.date) return false;
    const [day, month, year] = t.date.split('/');
    const taskDate = new Date(Number(year), Number(month) - 1, Number(day));
    return taskDate >= currentMonday;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(currentWeekTasks.length / itemsPerPage);
  
  const paginatedTasks = currentWeekTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const todo = paginatedTasks.filter(t => t.status === 'Chưa làm');
  const inProgress = paginatedTasks.filter(t => t.status === 'Đang làm');
  const done = paginatedTasks.filter(t => t.status === 'Hoàn thành');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-bold text-gray-900 flex items-center gap-2 flex-wrap">
          Tiến độ công việc
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
            {formattedDate} (Tuần {weekNumber})
          </span>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
        {/* TODO Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-gray-100">
            <span className="text-sm font-bold text-gray-500">Chưa làm</span>
            <span className="text-xs text-gray-400">{todo.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {todo.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-gray-400 italic">Trống</div>
            ) : (
              todo.map(task => (
                <div key={task.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-700 flex items-start gap-2 hover:border-primary/30 cursor-pointer transition-colors">
                  <div className="w-1 h-4 bg-gray-300 rounded-full shrink-0 mt-0.5"></div>
                  <span className="line-clamp-2">{task.title}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* IN PROGRESS Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-primary/20">
            <span className="text-sm font-bold text-primary">Đang làm</span>
            <span className="text-xs text-primary/70">{inProgress.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {inProgress.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-gray-400 italic">Trống</div>
            ) : (
              inProgress.map(task => (
                <div key={task.id} className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-xs text-gray-800 flex items-start gap-2 hover:border-primary/30 cursor-pointer transition-colors">
                  <div className="w-1 h-4 bg-primary/40 rounded-full shrink-0 mt-0.5"></div>
                  <span className="line-clamp-2">{task.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-success/20">
            <span className="text-sm font-bold text-success">Hoàn thành</span>
            <span className="text-xs text-success/70">{done.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {done.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-gray-400 italic">Trống</div>
            ) : (
              done.map(task => (
                <div key={task.id} className="bg-success/5 p-3 rounded-lg border border-success/10 text-xs text-gray-600 flex items-start gap-2 hover:border-success/30 cursor-pointer transition-colors">
                  <div className="w-1 h-4 bg-success/40 rounded-full shrink-0 mt-0.5"></div>
                  <span className="line-clamp-2 line-through opacity-70">{task.title}</span>
                </div>
              ))
            )}
          </div>
        </div>
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
