'use client';

import TransactionFilterCard from './TransactionFilterCard';
import DonutChartCard from '../shared/DonutChartCard';
import { ArrowUpRight, ArrowDownRight, Wallet, PieChart, TrendingUp } from 'lucide-react';

interface TransactionSidebarProps {
  transactions: any[];
  wallets: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterWallet: string;
  setFilterWallet: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterDate: string;
  setFilterDate: (val: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export default function TransactionSidebar({
  transactions,
  wallets,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterWallet,
  setFilterWallet,
  filterMonth,
  setFilterMonth,
  filterDate,
  setFilterDate,
  onClearFilters,
  hasFilters
}: TransactionSidebarProps) {
  // Calculate summary for sidebar charts
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const netBalance = totalIncome - totalExpense;

  // Chart data for Income vs Expense
  const totalVal = (totalIncome + totalExpense) || 1;
  const chartData = [
    { 
      name: 'Thu nhập', 
      value: Math.round((totalIncome / totalVal) * 100), 
      amount: `${totalIncome.toLocaleString('vi-VN')} đ`, 
      color: '#10b981' 
    },
    { 
      name: 'Chi tiêu', 
      value: Math.round((totalExpense / totalVal) * 100), 
      amount: `${totalExpense.toLocaleString('vi-VN')} đ`, 
      color: '#ef4444' 
    },
  ];

  const chartCenter = (
    <div className="flex flex-col items-center">
      <span className="text-sm font-bold text-gray-900">{transactions.length}</span>
      <span className="text-[10px] text-gray-500">Giao dịch</span>
    </div>
  );

  // Highest transaction
  const highestTransaction = transactions.length > 0
    ? [...transactions].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0]
    : null;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Transaction Filter Card */}
      <TransactionFilterCard 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
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

      {/* Income vs Expense Donut Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <DonutChartCard 
          title="Tỷ lệ Thu - Chi"
          data={chartData}
          centerElement={chartCenter}
          showLegendAmounts={true}
        />
      </div>

      {/* Highlight Card: Largest Transaction */}
      {highestTransaction && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-primary" />
              Giao dịch lớn nhất
            </span>
            <span className="text-[11px] text-gray-400">{highestTransaction.date}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">{highestTransaction.title}</span>
              <span className="text-xs text-gray-500">{highestTransaction.wallet_name || 'Ví cá nhân'}</span>
            </div>
            <span className={`text-sm font-extrabold ${highestTransaction.amount < 0 ? 'text-danger' : 'text-success'}`}>
              {highestTransaction.amount > 0 ? '+' : ''}{Number(highestTransaction.amount).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
