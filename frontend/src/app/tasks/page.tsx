'use client';

import PageHeader from '@/components/shared/PageHeader';
import WhiteStatCard from '@/components/shared/WhiteStatCard';
import TaskListExtended from '@/components/tasks/TaskListExtended';
import TaskSidebar from '@/components/tasks/TaskSidebar';
import { CheckSquare, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quản lý công việc</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi, quản lý và hoàn thành công việc hiệu quả mỗi ngày.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              className="block w-full sm:w-48 pl-3 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
              placeholder="Tìm kiếm công việc..."
            />
          </div>
          
          <select className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none">
            <option>Trạng thái</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none">
            <option>Ưu tiên</option>
          </select>
          
          <button className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} className="text-gray-400" /> Sắp xếp
          </button>
          
          <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm ml-auto sm:ml-0">
            + Thêm công việc
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <WhiteStatCard 
          title="Tổng số task"
          amount="24"
          subtitle="Tất cả công việc"
          icon={<CheckSquare size={20} />}
          iconBgColor="bg-indigo-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Đang làm"
          amount="7"
          subtitle="Công việc đang thực hiện"
          icon={<RefreshCw size={20} />}
          iconBgColor="bg-blue-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Hoàn thành"
          amount="10"
          subtitle="Công việc đã hoàn thành"
          icon={<CheckCircle size={20} />}
          iconBgColor="bg-emerald-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Quá hạn"
          amount="2"
          subtitle="Cần xử lý sớm"
          icon={<Clock size={20} />}
          iconBgColor="bg-red-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="col-span-1 lg:col-span-7 xl:col-span-7">
          <TaskListExtended />
        </div>
        <div className="col-span-1 lg:col-span-5 xl:col-span-5">
          <TaskSidebar />
        </div>
      </div>
    </div>
  );
}
