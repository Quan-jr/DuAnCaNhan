'use client';

import { Wallet, MoreHorizontal } from 'lucide-react';
import { mockInitialSources } from '@/lib/mockData';

interface InitialBalanceSourcesProps {
  earnings?: any[];
  loading?: boolean;
}

export default function InitialBalanceSources({ earnings, loading = false }: InitialBalanceSourcesProps) {
  const list = earnings || mockInitialSources;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[150px]">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        <span className="text-sm text-gray-500 mt-2">Đang tải nguồn số dư...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-md font-bold text-gray-900 mb-6">Nguồn số dư ban đầu</h3>
      <div className="flex flex-col gap-4">
        {list.map(source => (
          <div key={source.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
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
  );
}
