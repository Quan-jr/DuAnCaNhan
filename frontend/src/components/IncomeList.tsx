'use client';

import { mockEarnings } from '@/lib/mockData';

export default function IncomeList() {
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Thu nhập gần đây</h2>
        <button className="text-sm text-primary font-medium hover:underline">Xem tất cả</button>
      </div>
      
      <div className="w-full">
        <div className="flex text-xs font-semibold text-gray-500 mb-3 px-2">
          <div className="w-1/3">Ngày nhận</div>
          <div className="w-1/3 text-right">Số tiền</div>
          <div className="w-1/3 pl-4">Mô tả</div>
        </div>
        
        <div className="flex flex-col gap-2">
          {mockEarnings.map((income) => (
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
    </div>
  );
}

function title(str: string) {
  if (str.length > 20) return str.substring(0, 18) + '...';
  return str;
}
