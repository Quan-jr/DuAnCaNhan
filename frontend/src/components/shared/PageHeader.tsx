'use client';

import { Search, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  buttonText?: string;
  onSearch?: (query: string) => void;
  onAdd?: () => void;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  searchPlaceholder = 'Tìm kiếm...', 
  buttonText, 
  onSearch, 
  onAdd 
}: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-colors"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        
        {buttonText && (
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>{buttonText}</span>
          </button>
        )}
      </div>
    </header>
  );
}
