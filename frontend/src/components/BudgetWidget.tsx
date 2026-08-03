'use client';

import { mockBudgetDistribution, mockSummary } from '@/lib/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function BudgetWidget() {
  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Ví / Ngân sách</h2>
      
      {/* Wallet Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100 relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-20px] opacity-20">
           <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
             <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" />
           </svg>
        </div>
        <p className="text-sm font-medium text-blue-600 mb-1 relative z-10">Ví chính</p>
        <h3 className="text-2xl font-bold text-gray-900 relative z-10">{mockSummary.currentBalance.toLocaleString('vi-VN')} đ</h3>
        <p className="text-xs text-gray-500 mt-2 relative z-10">Số dư hiện tại</p>
      </div>
      
      <h3 className="text-md font-bold text-gray-800 mb-4">Phân bổ ngân sách</h3>
      
      <div className="flex flex-col sm:flex-row flex-1 items-center justify-between gap-4">
        <div className="w-full sm:w-1/2 h-[160px] sm:h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockBudgetDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {mockBudgetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value}%`, 'Tỷ lệ']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full sm:w-1/2 sm:pl-4 flex flex-col gap-3 sm:gap-2">
          {mockBudgetDistribution.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-medium text-gray-600">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
