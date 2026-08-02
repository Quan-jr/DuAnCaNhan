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
}

export default function WalletList({ onSelectWallet, selectedWalletId = 1 }: WalletListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Danh sách ví</h2>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 bg-gray-50/50">
              <th className="p-4 font-medium">Tên ví</th>
              <th className="p-4 font-medium">Ngân sách tháng</th>
              <th className="p-4 font-medium">Số dư đầu</th>
              <th className="p-4 font-medium">Số dư hiện tại</th>
              <th className="p-4 font-medium">Ngày giao dịch</th>
              <th className="p-4 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {mockWallets.map((wallet) => {
              const Icon = iconMap[wallet.icon] || Wallet;
              const isSelected = selectedWalletId === wallet.id;
              
              return (
                <tr 
                  key={wallet.id} 
                  onClick={() => onSelectWallet?.(wallet.id)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${wallet.color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{wallet.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{wallet.month}</td>
                  <td className="p-4 text-sm font-medium text-gray-700">{wallet.initialBalance.toLocaleString('vi-VN')} đ</td>
                  <td className={`p-4 text-sm font-bold ${wallet.currentBalance < wallet.initialBalance ? 'text-success' : 'text-gray-900'}`}>
                    {wallet.currentBalance.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-sm text-gray-500">{wallet.date}</td>
                  <td className="p-4">
                    <button className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Hiển thị 1 đến {mockWallets.length} của {mockWallets.length} ví</span>
        <div className="flex gap-1">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50">&lt;</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white shadow-sm">1</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50">&gt;</button>
        </div>
      </div>
    </div>
  );
}
