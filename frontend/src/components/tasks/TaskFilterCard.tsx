'use client';

import { Filter, Search, RefreshCw, X } from 'lucide-react';

interface TaskFilterCardProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterDate: string;
  setFilterDate: (val: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export default function TaskFilterCard({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterMonth,
  setFilterMonth,
  filterDate,
  setFilterDate,
  onClearFilters,
  hasFilters
}: TaskFilterCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Bộ lọc công việc</h3>
            <p className="text-[11px] text-gray-500">Tìm kiếm & lọc theo tiêu chí</p>
          </div>
        </div>

        {hasFilters && (
          <button 
            type="button"
            onClick={onClearFilters}
            className="text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={12} />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
            placeholder="Tìm theo tiêu đề, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Select Status & Priority */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trạng thái</label>
            <select 
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Chưa làm">Chưa làm</option>
              <option value="Đang làm">Đang làm</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Tạm hoãn">Tạm hoãn</option>
              <option value="Hủy bỏ">Hủy bỏ</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Độ ưu tiên</label>
            <select 
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="Tất cả">Tất cả ưu tiên</option>
              <option value="Thấp">Thấp</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Cao">Cao</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
            </select>
          </div>
        </div>

        {/* Date & Month Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lọc theo tháng</label>
            <input
              type="month"
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lọc theo ngày</label>
            <input
              type="date"
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
