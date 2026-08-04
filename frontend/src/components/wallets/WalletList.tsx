'use client';

import { useState } from 'react';

interface WalletListProps {
  onSelectWallet?: (walletId: number) => void;
  selectedWalletId?: number;
  wallets?: any[];
  ledger?: any[];
  rawRows?: any[];
  loading?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'NULL';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('vi-VN');
  } catch {
    return dateStr;
  }
};

export default function WalletList({ rawRows = [], loading = false }: WalletListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-12 min-h-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-sm text-gray-500 mt-3">Đang tải dữ liệu từ database...</span>
      </div>
    );
  }

  const totalItems = rawRows.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = rawRows.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Lịch sử biến động số dư</h2>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {totalItems} bản ghi
        </span>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 bg-gray-50/50">
              <th className="p-4 font-medium">Mã giao dịch</th>
              <th className="p-4 font-medium">Tháng ngân sách</th>
              <th className="p-4 font-medium">Mã số dư ban đầu</th>
              <th className="p-4 font-medium text-right">Sổ quỹ tiền mặt</th>
              <th className="p-4 font-medium text-right">Số dư hiện tại</th>
              <th className="p-4 font-medium">Ngày thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                  Không có dữ liệu trong bảng wallets
                </td>
              </tr>
            ) : (
              currentRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-gray-800">{row.id}</td>
                  <td className="p-4 text-xs font-medium text-gray-700">{row.budget_month ? String(row.budget_month) : 'NULL'}</td>
                  <td className="p-4 text-xs text-gray-500">{row.initial_balance_id != null ? String(row.initial_balance_id) : 'NULL'}</td>
                  <td className="p-4 text-sm font-bold text-right text-emerald-600">
                    {row['Cash book'] != null ? `${Number(row['Cash book']).toLocaleString('vi-VN')} đ` : 'NULL'}
                  </td>
                  <td className="p-4 text-sm font-bold text-right text-primary">
                    {row.current_balance != null ? `${Number(row.current_balance).toLocaleString('vi-VN')} đ` : 'NULL'}
                  </td>
                  <td className="p-4 text-xs text-gray-500">{row.transaction_date ? formatDate(row.transaction_date) : 'NULL'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-auto">
        <span>
          Hiển thị {totalItems > 0 ? startIndex + 1 : 0} đến {Math.min(startIndex + pageSize, totalItems)} của {totalItems} bản ghi
        </span>
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                currentPage === page 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

