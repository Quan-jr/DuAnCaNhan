import { ReactNode } from 'react';

interface WhiteStatCardProps {
  title: string;
  amount: string;
  subtitle: string;
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  titleColor?: string;
}

export default function WhiteStatCard({ 
  title, 
  amount, 
  subtitle, 
  icon, 
  iconBgColor, 
  iconTextColor,
  titleColor
}: WhiteStatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-medium mb-1 ${titleColor || iconTextColor}`}>{title}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{amount}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
