'use client';

import { MoreHorizontal, Wallet, Plane, Shield, PiggyBank } from 'lucide-react';
import { mockWallets } from '@/lib/mockData';

const iconMap: Record<string, any> = {
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  'plane': Plane,
  'shield': Shield
};

interface WalletListProps {
  onSelectWallet?: (walletId: number) => void;
  selectedWalletId?: number;
  wallets?: any[];
  ledger?: any[];
  loading?: boolean;
}

export default function WalletList({ onSelectWallet, selectedWalletId = 1, wallets, ledger = [], loading = false }: WalletListProps) {
  const list = wallets || mockWallets;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-12 min-h-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-sm text-gray-500 mt-3">Đang tải danh sách ví...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Lịch sử biến động số dư</h2>
        {list.length > 0 && (
          <select 
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-gray-700"
            value={selectedWalletId}
            onChange={(e) => onSelectWallet?.(Number(e.target.value))}
          >
            {list.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        )}
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 bg-gray-50/50">
              <th className="p-4 font-medium">Mô tả giao dịch</th>
              <th className="p-4 font-medium">Loại</th>
              <th className="p-4 font-medium text-right">Số tiền</th>
              <th className="p-4 font-medium text-right">Số dư hiện tại</th>
              <th className="p-4 font-medium text-right">Ngày thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">Không có dữ liệu giao dịch</td>
              </tr>
            ) : (
              ledger.map((entry) => {
                const isIncome = entry.type === 'income';
                return (
                  <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-gray-800 text-sm">{entry.title}</span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isIncome ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {isIncome ? 'Thu nhập' : 'Chi tiêu'}
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-bold text-right ${isIncome ? 'text-success' : 'text-danger'}`}>
                      {isIncome ? '+' : ''}{entry.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 text-sm font-bold text-primary text-right">
                      {entry.runningBalance.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 text-sm text-gray-500 text-right">{entry.displayDate}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-auto">
        <span>Hiển thị 1 đến {ledger.length} của {ledger.length} bản ghi</span>
        <div className="flex gap-1">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50">&lt;</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white shadow-sm">1</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50">&gt;</button>
        </div>
      </div>
    </div>
  );
}
