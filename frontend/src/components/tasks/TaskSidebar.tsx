'use client';

import DonutChartCard from '../shared/DonutChartCard';
import TaskKanban from './TaskKanban';
import UpcomingTasks from './UpcomingTasks';
import TaskFilterCard from './TaskFilterCard';
import StudyStreakCard from './StudyStreakCard';

interface TaskSidebarProps {
  tasks: any[];
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  filterStatus?: string;
  setFilterStatus?: (val: string) => void;
  filterPriority?: string;
  setFilterPriority?: (val: string) => void;
  filterMonth?: string;
  setFilterMonth?: (val: string) => void;
  filterDate?: string;
  setFilterDate?: (val: string) => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
  onCompleteTask?: (task: any) => void;
}

export default function TaskSidebar({ 
  tasks,
  searchQuery = '',
  setSearchQuery = () => {},
  filterStatus = 'Tất cả',
  setFilterStatus = () => {},
  filterPriority = 'Tất cả',
  setFilterPriority = () => {},
  filterMonth = '',
  setFilterMonth = () => {},
  filterDate = '',
  setFilterDate = () => {},
  onClearFilters = () => {},
  hasFilters = false,
  onCompleteTask
}: TaskSidebarProps) {
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
      {/* Chuỗi học tập & Giữ chuỗi */}
      <StudyStreakCard tasks={tasks} onCompleteTask={onCompleteTask} />

      {/* Task Filter Card (Placed above UpcomingTasks) */}
      <TaskFilterCard 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        onClearFilters={onClearFilters}
        hasFilters={hasFilters}
      />

    </div>
  );
}
