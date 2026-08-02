'use client';

import { mockTransactions } from '@/lib/mockData';
import { ShoppingCart, Zap, Utensils, Fuel, Coffee } from 'lucide-react';

const iconMap: Record<string, any> = {
  cart: ShoppingCart,
  zap: Zap,
  utensils: Utensils,
  fuel: Fuel,
  coffee: Coffee
};

export default function TransactionList() {
  return (
    <div className="glass-card p-6 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Giao dịch gần đây</h2>
        <button className="text-sm text-primary font-medium hover:underline">Xem tất cả</button>
      </div>
      
      <div className="flex flex-col gap-4">
        {mockTransactions.map((tx) => {
          const Icon = iconMap[tx.icon] || ShoppingCart;
          return (
            <div key={tx.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <Icon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{tx.title}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{tx.date}</span>
                </div>
              </div>
              <span className={`text-sm font-bold ${tx.amount < 0 ? 'text-danger' : 'text-success'}`}>
                {tx.amount < 0 ? '' : '+'}{tx.amount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
