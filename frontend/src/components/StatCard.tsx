import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle: string;
  icon: ReactNode;
  bgColor: string;
  textColor: string;
}

export default function StatCard({ title, amount, subtitle, icon, bgColor, textColor }: StatCardProps) {
  return (
    <div className={`glass-card p-5 flex flex-col gap-3 ${bgColor}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm">
          {icon}
        </div>
        <span className={`font-medium ${textColor}`}>{title}</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{amount}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
