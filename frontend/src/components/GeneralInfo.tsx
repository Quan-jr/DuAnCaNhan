'use client';

import { mockSummary } from '@/lib/mockData';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

export default function GeneralInfo() {
  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin tổng quan</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="bg-success-light/30 p-4 rounded-xl flex items-center gap-3 border border-success-light">
          <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center text-success">
            <ArrowUpRight size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Tổng thu nhập</p>
            <p className="text-sm font-bold text-gray-900">{mockSummary.totalIncome.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
        
        <div className="bg-danger-light/30 p-4 rounded-xl flex items-center gap-3 border border-danger-light">
          <div className="w-8 h-8 rounded-full bg-danger-light flex items-center justify-center text-danger">
            <ArrowDownRight size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Tổng chi tiêu</p>
            <p className="text-sm font-bold text-gray-900">{mockSummary.totalExpense.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
        
        <div className="bg-info-light/30 p-4 rounded-xl flex items-center gap-3 border border-info-light">
          <div className="w-8 h-8 rounded-full bg-info-light flex items-center justify-center text-info">
            <Wallet size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Tiết kiệm</p>
            <p className="text-sm font-bold text-gray-900">{mockSummary.savedAmount.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">Tỷ lệ chi tiêu</span>
            <span className="font-bold text-gray-900">{mockSummary.expenseRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${mockSummary.expenseRate}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">Mục tiêu tiết kiệm</span>
            <span className="font-bold text-gray-900">{mockSummary.savingGoal.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-success h-2 rounded-full" style={{ width: `${(mockSummary.savedAmount / mockSummary.savingGoal) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
