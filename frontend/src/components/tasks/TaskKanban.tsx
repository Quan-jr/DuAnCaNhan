interface TaskKanbanProps {
  tasks: any[];
}

export default function TaskKanban({ tasks }: TaskKanbanProps) {
  const todo = tasks.filter(t => t.status === 'Chưa làm');
  const inProgress = tasks.filter(t => t.status === 'Đang làm');
  const done = tasks.filter(t => t.status === 'Hoàn thành');

  return (
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
    </div>
  );
}
