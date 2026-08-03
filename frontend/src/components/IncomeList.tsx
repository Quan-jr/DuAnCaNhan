'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

export default function IncomeList() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('earnings')
          .select('*')
          .order('salary_day', { ascending: false });

        if (error) throw error;
        if (data) {
          const mapped = data.map((e: any) => ({
            id: e.id,
            date: formatDate(e.salary_day),
            amount: e.amount,
            title: e.description,
            type: e.description.toLowerCase().includes('lương') ? 'Lương' : 'Freelance'
          }));
          setEarnings(mapped);
        }
      } catch (err: any) {
        console.error('Lỗi khi tải thu nhập:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Thu nhập gần đây</h2>
        <span className="text-xs text-gray-500">{earnings.length} nguồn</span>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : earnings.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">Không có dữ liệu thu nhập</div>
      ) : (
        <div className="w-full">
          <div className="flex text-xs font-semibold text-gray-500 mb-3 px-2">
            <div className="w-1/3">Ngày nhận</div>
            <div className="w-1/3 text-right">Số tiền</div>
            <div className="w-1/3 pl-4">Mô tả</div>
          </div>
          
          <div className="flex flex-col gap-2">
            {earnings.map((income) => (
              <div key={income.id} className="flex items-center text-sm py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-1/3 font-medium text-gray-800">{income.date}</div>
                <div className="w-1/3 text-right font-bold text-success">{income.amount.toLocaleString('vi-VN')} đ</div>
                <div className="w-1/3 pl-4 flex items-center justify-between">
                  <span className="text-gray-600 truncate">{title(income.title)}</span>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                    income.type === 'Lương' ? 'bg-success-light text-success' : 'bg-info-light text-info'
                  }`}>
                    {income.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function title(str: string) {
  if (str.length > 20) return str.substring(0, 18) + '...';
  return str;
}
