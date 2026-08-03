import { mockSummary } from '@/lib/mockData';
import StatCard from '@/components/StatCard';
import TaskList from '@/components/TaskList';
import TransactionList from '@/components/TransactionList';
import BudgetWidget from '@/components/BudgetWidget';
import IncomeList from '@/components/IncomeList';
import GeneralInfo from '@/components/GeneralInfo';
import { Wallet, PieChart, CheckSquare, Bell, Calendar } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Xin chào, Nguyễn Văn A! 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Đây là tổng quan tài chính và công việc của bạn.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-xs sm:text-sm font-medium text-gray-700">
            Tháng 06/2026
            <Calendar size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors">
              <Bell size={18} className="text-gray-600" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full"></div>
            </div>
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer" />
          </div>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard 
          title="Tổng thu nhập" 
          amount={`${mockSummary.totalIncome.toLocaleString('vi-VN')} đ`} 
          subtitle="Trong tháng 06/2026"
          icon={<div className="w-8 h-8 rounded-full bg-success flex items-center justify-center"><Wallet size={16} className="text-white" /></div>}
          bgColor="bg-success-light/20"
          textColor="text-success"
        />
        <StatCard 
          title="Số dư hiện tại" 
          amount={`${mockSummary.currentBalance.toLocaleString('vi-VN')} đ`} 
          subtitle="Ví / Ngân sách"
          icon={<div className="w-8 h-8 rounded-full bg-info flex items-center justify-center"><Wallet size={16} className="text-white" /></div>}
          bgColor="bg-info-light/20"
          textColor="text-info"
        />
        <StatCard 
          title="Tổng chi tiêu" 
          amount={`${mockSummary.totalExpense.toLocaleString('vi-VN')} đ`} 
          subtitle="Trong tháng 06/2026"
          icon={<div className="w-8 h-8 rounded-full bg-danger flex items-center justify-center"><PieChart size={16} className="text-white" /></div>}
          bgColor="bg-danger-light/20"
          textColor="text-danger"
        />
        <StatCard 
          title="Tổng số task" 
          amount={`${mockSummary.totalTasks}`} 
          subtitle="Công việc"
          icon={<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><CheckSquare size={16} className="text-white" /></div>}
          bgColor="bg-primary-light/40"
          textColor="text-primary"
        />
      </div>

      {/* Row 1: Financial & Target Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-1 lg:col-span-8">
          <GeneralInfo />
        </div>
        <div className="col-span-1 lg:col-span-4">
          <BudgetWidget />
        </div>
      </div>

      {/* Row 2: Details & Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <TaskList />
        </div>
        <div className="col-span-1">
          <TransactionList />
        </div>
        <div className="col-span-1">
          <IncomeList />
        </div>
      </div>
    </div>
  );
}
