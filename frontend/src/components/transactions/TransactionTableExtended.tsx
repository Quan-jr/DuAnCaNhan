'use client';

import { useState } from 'react';
import { 
  ShoppingCart, 
  Zap, 
  Utensils, 
  Fuel, 
  Coffee, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit3, 
  Wallet,
  Receipt,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, any> = {
  cart: ShoppingCart,
  zap: Zap,
  utensils: Utensils,
  fuel: Fuel,
  coffee: Coffee,
  wallet: Wallet,
  receipt: Receipt
};

interface TransactionTableExtendedProps {
  transactions: any[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  onEdit?: (tx: any) => void;
}

export default function TransactionTableExtended({
  transactions,
  loading,
  fetchTransactions,
  onEdit
}: TransactionTableExtendedProps) {
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTransactions();
    } catch (err: any) {
      alert(`Lỗi khi xóa giao dịch: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <span className="text-sm font-medium text-gray-500">Đang tải danh sách giao dịch...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Receipt size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Danh sách giao dịch chi tiết</h2>
            <p className="text-xs text-gray-500">Hiển thị {transactions.length} bản ghi</p>
          </div>
        </div>
      </div>

      {/* Body List */}
      <div className="divide-y divide-gray-50 max-h-[650px] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <FileText size={40} className="text-gray-300 stroke-1" />
            <span className="text-sm font-medium text-gray-500">Chưa có giao dịch nào phù hợp</span>
            <span className="text-xs text-gray-400">Hãy thêm mới hoặc thử thay đổi bộ lọc.</span>
          </div>
        ) : (
          transactions.map((tx) => {
            const Icon = iconMap[tx.icon] || (tx.amount >= 0 ? ArrowUpRight : ArrowDownRight);
            const isIncome = tx.amount >= 0;

            return (
              <div 
                key={tx.id} 
                className="p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isIncome 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {tx.title || 'Giao dịch không tên'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{tx.date}</span>
                      {tx.wallet_name && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full border border-gray-200">
                          {tx.wallet_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isIncome ? '+' : ''}{Number(tx.amount).toLocaleString('vi-VN')} đ
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(tx)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
