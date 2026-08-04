'use client';

import DonutChartCard from '../shared/DonutChartCard';
import TaskKanban from './TaskKanban';
import UpcomingTasks from './UpcomingTasks';

interface TaskSidebarProps {
  tasks: any[];
}

export default function TaskSidebar({ tasks }: TaskSidebarProps) {
  const total = tasks.length || 1;
  const inProgress = tasks.filter(t => t.status === 'Đang làm').length;
  const completed = tasks.filter(t => t.status === 'Hoàn thành').length;
  const todo = tasks.filter(t => t.status === 'Chưa làm').length;
  const overdue = tasks.filter(t => t.status === 'Quá hạn').length;

  const taskStats = [
    { name: 'Đang làm', value: Math.round((inProgress / total) * 100), amount: inProgress.toString(), color: '#3b82f6' },
    { name: 'Hoàn thành', value: Math.round((completed / total) * 100), amount: completed.toString(), color: '#10b981' },
    { name: 'Chưa làm', value: Math.round((todo / total) * 100), amount: todo.toString(), color: '#9ca3af' },
    { name: 'Quá hạn', value: Math.round((overdue / total) * 100), amount: overdue.toString(), color: '#ef4444' },
  ];

  const progressPercent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const chartCenter = (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-gray-900">{tasks.length}</span>
      <span className="text-[10px] text-gray-500">Tổng task</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <UpcomingTasks />
      
      <TaskKanban tasks={tasks} />
 
      {/* Progress Overview Donut */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
        <div className="h-full flex flex-col p-2 flex-1 justify-center">
          <DonutChartCard 
            title="Tổng quan tiến độ"
            data={taskStats}
            centerElement={chartCenter}
            showLegendAmounts={true}
          />
          <div className="px-6 pb-6 pt-2">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500 font-medium">Hoàn thành mục tiêu tháng 06</span>
              <span className="font-bold text-gray-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
