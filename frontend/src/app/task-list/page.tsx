import TaskListExtended from '@/components/tasks/TaskListExtended';

export default function TaskListPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Task List</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tất cả công việc của bạn.</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 lg:w-3/4">
        <TaskListExtended tasks={[]} loading={false} fetchTasks={async () => {}} />
      </div>
    </div>
  );
}
