'use client';

import { useState, useEffect } from 'react';
import { mockWallets, mockBudgetDistribution } from '@/lib/mockData';
import { Wallet, Plane, Shield, PiggyBank, MoreHorizontal } from 'lucide-react';
import DonutChartCard from '../shared/DonutChartCard';
import ProgressBarCard from '../shared/ProgressBarCard';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, any> = {
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  'plane': Plane,
  'shield': Shield
};

const getFallbackDescriptionForAmount = (amount: number) => {
  if (amount === -450000) return 'Siêu thị WinMart';
  if (amount === -650000) return 'Tiền điện';
  if (amount === -120000) return 'Ăn uống';
  if (amount === -200000) return 'Xăng xe';
  if (amount === -45000) return 'Cà phê';
  if (amount === -300000) return 'Mua sách';
  if (amount === -150000) return 'Đăng ký Netflix';
  if (amount === -500000) return 'Quà sinh nhật bạn';
  if (amount === -80000) return 'Trà sữa';
  if (amount === -1200000) return 'Mua giày mới';
  return amount < 0 ? 'Chi tiêu khác' : 'Thu nhập khác';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};

interface WalletDetailSidebarProps {
  walletId: number;
  wallets?: any[];
}

export default function WalletDetailSidebar({ walletId, wallets }: WalletDetailSidebarProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const list = wallets || mockWallets;
  const wallet = list.find(w => w.id === walletId) || list[0];

  useEffect(() => {
    const fetchTx = async () => {
      if (!walletId) return;
      try {
        setTxLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id__wallet', walletId)
          .order('transaction_date', { ascending: false });

        if (error) throw error;
        if (data) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            title: t.description || getFallbackDescriptionForAmount(t.amount),
            amount: t.amount,
            date: formatDate(t.transaction_date),
          }));
          setTransactions(mapped);
        }
      } catch (err: any) {
        console.error('Lỗi tải giao dịch:', err.message);
      } finally {
        setTxLoading(false);
      }
    };
    fetchTx();
  }, [walletId]);
  
  if (!wallet) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center min-h-[200px]">
        <span className="text-sm text-gray-500">Không tìm thấy dữ liệu ví</span>
      </div>
    );
  }

  const Icon = iconMap[wallet.icon] || Wallet;
  
  // Custom center element for the DonutChart
  const chartCenter = (
    <>
      <span className="text-xs text-gray-500 font-medium">100%</span>
      <span className="text-[10px] text-gray-400">Tổng ngân sách</span>
    </>
  );

  const spentAmount = Math.max(0, wallet.initialBalance - wallet.currentBalance);
  const progressPercent = wallet.initialBalance > 0 ? (spentAmount / wallet.initialBalance) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Wallet Detail Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-md font-bold text-gray-900 mb-6">Chi tiết ví</h3>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm relative ${wallet.color || 'bg-indigo-500'}`}>
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
      
      {/* Wallet Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold text-gray-900">Giao dịch ví này</h3>
          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
            {transactions.length} GD
          </span>
        </div>
        
        {txLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">Không có giao dịch nào</div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-gray-800">{tx.title}</span>
                  <span className="text-[10px] text-gray-400">{tx.date}</span>
                </div>
                <span className={`text-sm font-bold ${tx.amount < 0 ? 'text-danger' : 'text-success'}`}>
                  {tx.amount < 0 ? '-' : '+'}{Math.abs(tx.amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            ))}
          </div>
        )}
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
        currentAmount={`${spentAmount.toLocaleString('vi-VN')} đ`}
        remainingLabel={
          <><div className="w-4 h-4 rounded-full bg-success/10 flex items-center justify-center text-success"><ArrowUp size={10} /></div> Còn lại</>
        }
        remainingAmount={`${wallet.currentBalance.toLocaleString('vi-VN')} đ`}
        progressPercentage={progressPercent}
        progressBarColor="bg-primary"
        bottomLeftText="Tỷ lệ sử dụng"
        bottomRightText={`${progressPercent.toFixed(1)}%`}
      />

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
