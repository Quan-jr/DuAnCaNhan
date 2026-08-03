'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ReactNode } from 'react';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  amount?: string;
}

interface DonutChartCardProps {
  title: string;
  data: ChartDataItem[];
  centerElement?: ReactNode;
  showLegendAmounts?: boolean;
}

export default function DonutChartCard({ 
  title, 
  data, 
  centerElement,
  showLegendAmounts = false
}: DonutChartCardProps) {
  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <h3 className="text-md font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="flex flex-col sm:flex-row flex-1 items-center justify-between gap-4">
        <div className="w-full sm:w-[45%] h-[180px] sm:h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value}%`, 'Tỷ lệ']} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Center Element Overlay */}
          {centerElement && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {centerElement}
            </div>
          )}
        </div>
        
        <div className="w-full sm:w-[55%] pl-0 sm:pl-4 flex flex-col gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-medium text-gray-600 truncate max-w-[80px] sm:max-w-[100px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-800 w-10 text-right">{item.value}%</span>
                {showLegendAmounts && item.amount && (
                  <span className="text-xs font-medium text-gray-500 w-20 text-right truncate">{item.amount}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
