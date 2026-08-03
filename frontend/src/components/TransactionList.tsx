'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Zap, Utensils, Fuel, Coffee, ArrowDown, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, any> = {
  cart: ShoppingCart,
  zap: Zap,
  utensils: Utensils,
  fuel: Fuel,
  coffee: Coffee
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

const getIconForAmount = (amount: number) => {
  if (amount === -450000) return 'cart';
  if (amount === -650000) return 'zap';
  if (amount === -120000) return 'utensils';
  if (amount === -200000) return 'fuel';
  if (amount === -45000) return 'coffee';
  return 'cart';
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

export default function TransactionList() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false });

        if (error) throw error;
        if (data) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            title: t.description || getFallbackDescriptionForAmount(t.amount),
            amount: t.amount,
            date: formatDate(t.transaction_date),
            icon: getIconForAmount(t.amount)
          }));
          setTransactions(mapped);
        }
      } catch (err: any) {
        console.error('Lỗi khi tải giao dịch:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Giao dịch gần đây</h2>
        <span className="text-xs text-gray-500">{transactions.length} giao dịch</span>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">Không có giao dịch nào</div>
      ) : (
        <div className="flex flex-col gap-4">
          {transactions.map((tx) => {
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
      )}
    </div>
  );
}
