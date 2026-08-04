'use client';

import { 
  Wallet, 
  DollarSign, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Briefcase,
  Gift,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface IncomeTableExtendedProps {
  earnings: any[];
  loading: boolean;
  fetchEarnings: () => Promise<void>;
  onEdit?: (item: any) => void;
}

export default function IncomeTableExtended({
  earnings,
  loading,
  fetchEarnings,
  onEdit
}: IncomeTableExtendedProps) {
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi thu nhập này?')) return;
    try {
      const { error } = await supabase
        .from('earnings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchEarnings();
    } catch (err: any) {
      alert(`Lỗi khi xóa thu nhập: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
        <span className="text-sm font-medium text-gray-500">Đang tải dữ liệu thu nhập...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Lịch sử thu nhập chi tiết</h2>
            <p className="text-xs text-gray-500">Hiển thị {earnings.length} nguồn thu</p>
          </div>
        </div>
      </div>

      {/* List / Table */}
      <div className="divide-y divide-gray-50 max-h-[650px] overflow-y-auto">
        {earnings.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <FileText size={40} className="text-gray-300 stroke-1" />
            <span className="text-sm font-medium text-gray-500">Chưa có dữ liệu thu nhập phù hợp</span>
            <span className="text-xs text-gray-400">Hãy bấm "+ Thêm thu nhập mới" để bắt đầu ghi nhận.</span>
          </div>
        ) : (
          earnings.map((item) => {
            const descLower = item.title.toLowerCase();
            let IconComponent = Briefcase;
            if (descLower.includes('thưởng') || descLower.includes('quà')) IconComponent = Gift;
            if (descLower.includes('lương')) IconComponent = DollarSign;

            return (
              <div 
                key={item.id} 
                className="p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <IconComponent size={20} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{item.date}</span>
                      {item.wallet_name && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full border border-emerald-100">
                          {item.wallet_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-extrabold text-emerald-600">
                    +{Number(item.amount).toLocaleString('vi-VN')} đ
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id)}
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
