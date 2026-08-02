'use client';

import { ReactNode } from 'react';

interface ProgressBarCardProps {
  title: string;
  icon?: ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  targetLabel: string;
  targetAmount: string;
  currentLabel: string;
  currentAmount: string;
  remainingLabel: string;
  remainingAmount: string;
  progressPercentage: number;
  progressBarColor?: string;
  bottomLeftText?: string;
  bottomRightText?: string;
}

export default function ProgressBarCard({
  title,
  icon,
  iconBgColor = 'bg-primary-light/30',
  iconTextColor = 'text-primary',
  targetLabel,
  targetAmount,
  currentLabel,
  currentAmount,
  remainingLabel,
  remainingAmount,
  progressPercentage,
  progressBarColor = 'bg-primary',
  bottomLeftText,
  bottomRightText
}: ProgressBarCardProps) {
  return (
    <div className="glass-card p-6 flex flex-col">
      <h3 className="text-md font-bold text-gray-800 mb-6">{title}</h3>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mb-6">
        <div className="flex items-start gap-3">
          {icon && (
            <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center ${iconTextColor} shrink-0`}>
              {icon}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">{targetLabel}</span>
            <span className="text-lg font-bold text-gray-900">{targetAmount}</span>
          </div>
        </div>
        
        <div className="flex gap-6 sm:gap-8">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              {currentLabel}
            </span>
            <span className="text-lg font-bold text-gray-900">{currentAmount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              {remainingLabel}
            </span>
            <span className="text-lg font-bold text-gray-900">{remainingAmount}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-500">Tỷ lệ hoàn thành / sử dụng</span>
          <span className={`font-bold ${iconTextColor.replace('text-', 'text-')}`}>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
          <div 
            className={`h-2.5 rounded-full ${progressBarColor}`} 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{bottomLeftText}</span>
          <span>{bottomRightText}</span>
        </div>
      </div>
    </div>
  );
}
