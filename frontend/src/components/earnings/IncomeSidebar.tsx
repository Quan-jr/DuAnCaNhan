'use client';

import IncomeFilterCard from './IncomeFilterCard';
import DonutChartCard from '../shared/DonutChartCard';
import { Award, DollarSign, TrendingUp } from 'lucide-react';

interface IncomeSidebarProps {
  earnings: any[];
  wallets: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterWallet: string;
  setFilterWallet: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterDate: string;
  setFilterDate: (val: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export default function IncomeSidebar({
  earnings,
  wallets,
  searchQuery,
  setSearchQuery,
  filterWallet,
  setFilterWallet,
  filterMonth,
  setFilterMonth,
  filterDate,
  setFilterDate,
  onClearFilters,
  hasFilters
}: IncomeSidebarProps) {
  // Category breakdown for Donut Chart
  const salarySum = earnings
    .filter(e => e.title.toLowerCase().includes('lương'))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const freelanceSum = earnings
    .filter(e => e.title.toLowerCase().includes('freelance') || e.title.toLowerCase().includes('dự án'))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalSum = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const otherSum = Math.max(0, totalSum - salarySum - freelanceSum);

  const totalVal = totalSum || 1;
  const chartData = [
    { 
      name: 'Lương cố định', 
      value: Math.round((salarySum / totalVal) * 100), 
      amount: `${salarySum.toLocaleString('vi-VN')} đ`, 
      color: '#10b981' 
    },
    { 
      name: 'Freelance / Thưởng', 
      value: Math.round((freelanceSum / totalVal) * 100), 
      amount: `${freelanceSum.toLocaleString('vi-VN')} đ`, 
      color: '#3b82f6' 
    },
    { 
      name: 'Thu nhập khác', 
      value: Math.round((otherSum / totalVal) * 100), 
      amount: `${otherSum.toLocaleString('vi-VN')} đ`, 
      color: '#f59e0b' 
    },
  ];

  const chartCenter = (
    <div className="flex flex-col items-center">
      <span className="text-sm font-bold text-gray-900">{earnings.length}</span>
      <span className="text-[10px] text-gray-500">Nguồn thu</span>
    </div>
  );

  // Highest Earning Record
  const highestEarning = earnings.length > 0
    ? [...earnings].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
    : null;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Income Filter Card */}
      <IncomeFilterCard 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterWallet={filterWallet}
        setFilterWallet={setFilterWallet}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        wallets={wallets}
        onClearFilters={onClearFilters}
        hasFilters={hasFilters}
      />

      {/* Donut Chart breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <DonutChartCard 
          title="Cấu trúc nguồn thu nhập"
          data={chartData}
          centerElement={chartCenter}
          showLegendAmounts={true}
        />
      </div>

      {/* Highest Earning Highlight Card */}
      {highestEarning && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={15} className="text-amber-500" />
              Khoản thu nhập lớn nhất
            </span>
            <span className="text-[11px] text-gray-400">{highestEarning.date}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">{highestEarning.title}</span>
              <span className="text-xs text-gray-500">{highestEarning.wallet_name || 'Ví chính'}</span>
            </div>
            <span className="text-sm font-extrabold text-emerald-600">
              +{Number(highestEarning.amount).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
