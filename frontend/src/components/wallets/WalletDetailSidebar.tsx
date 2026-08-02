'use client';

import { mockWallets, mockBudgetDistribution, mockInitialSources } from '@/lib/mockData';
import { Wallet, Plane, Shield, PiggyBank, MoreHorizontal } from 'lucide-react';
import DonutChartCard from '../shared/DonutChartCard';
import ProgressBarCard from '../shared/ProgressBarCard';

const iconMap: Record<string, any> = {
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  'plane': Plane,
  'shield': Shield
};

interface WalletDetailSidebarProps {
  walletId: number;
}

export default function WalletDetailSidebar({ walletId }: WalletDetailSidebarProps) {
  const wallet = mockWallets.find(w => w.id === walletId) || mockWallets[0];
  const Icon = iconMap[wallet.icon] || Wallet;
  
  // Custom center element for the DonutChart
  const chartCenter = (
    <>
      <span className="text-xs text-gray-500 font-medium">100%</span>
      <span className="text-[10px] text-gray-400">Tổng ngân sách</span>
    </>
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Wallet Detail Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-md font-bold text-gray-900 mb-6">Chi tiết ví</h3>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm relative ${wallet.color}`}>
              <Icon size={28} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">$</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">{wallet.name}</span>
              <span className="text-xl font-bold text-gray-900">{wallet.currentBalance.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex items-center gap-6">
              <span className="text-gray-500">Ngân sách tháng</span>
              <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-xs">{wallet.month}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-gray-500">Số dư đầu</span>
              <span className="font-bold text-gray-900">{wallet.initialBalance.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Allocation Donut Chart */}
      <DonutChartCard 
        title="Phân bổ ngân sách"
        data={mockBudgetDistribution}
        centerElement={chartCenter}
      />

      {/* Monthly Overview Progress Bar */}
      <ProgressBarCard 
        title="Tổng quan tháng"
        icon={<Wallet size={20} />}
        targetLabel="Ngân sách mục tiêu"
        targetAmount={`${wallet.initialBalance.toLocaleString('vi-VN')} đ`}
        currentLabel={
          <><div className="w-4 h-4 rounded-full bg-danger/10 flex items-center justify-center text-danger"><ArrowDown size={10} /></div> Đã sử dụng</>
        }
        currentAmount={`${(wallet.initialBalance - wallet.currentBalance).toLocaleString('vi-VN')} đ`}
        remainingLabel={
          <><div className="w-4 h-4 rounded-full bg-success/10 flex items-center justify-center text-success"><ArrowUp size={10} /></div> Còn lại</>
        }
        remainingAmount={`${wallet.currentBalance.toLocaleString('vi-VN')} đ`}
        progressPercentage={((wallet.initialBalance - wallet.currentBalance) / wallet.initialBalance) * 100}
        progressBarColor="bg-primary"
        bottomLeftText="Tỷ lệ sử dụng"
        bottomRightText={`${(((wallet.initialBalance - wallet.currentBalance) / wallet.initialBalance) * 100).toFixed(1)}%`}
      />

      {/* Initial Balance Sources */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-md font-bold text-gray-900 mb-6">Nguồn số dư ban đầu</h3>
        <div className="flex flex-col gap-4">
          {mockInitialSources.map(source => (
            <div key={source.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  {/* Using generic briefcase as fallback, assuming icon map if needed later */}
                  <Wallet size={16} /> 
                </div>
                <span className="text-sm font-medium text-gray-800">{source.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 w-20">{source.date}</span>
                <span className="text-sm font-bold text-success w-24 text-right">{source.amount.toLocaleString('vi-VN')} đ</span>
                <button className="text-gray-400 hover:text-gray-700">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Temporary inline icons to avoid adding more imports
function ArrowDown({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  );
}

function ArrowUp({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
}
