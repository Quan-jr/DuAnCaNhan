'use client';

import { Clock } from 'lucide-react';

import { useState } from 'react';

const mockUpcoming = [
  { id: 1, title: 'Hoàn thành báo cáo dự án Q2', date: '26/06/2026', priority: 'Cao', color: 'text-danger' },
  { id: 2, title: 'Học khóa học online', date: '30/06/2026', priority: 'Trung bình', color: 'text-warning' },
  { id: 3, title: 'Chuẩn bị bài thuyết trình', date: '29/06/2026', priority: 'Cao', color: 'text-danger' },
  { id: 4, title: 'Gửi email cho khách hàng', date: '01/07/2026', priority: 'Thấp', color: 'text-success' },
  { id: 5, title: 'Họp team tuần', date: '02/07/2026', priority: 'Trung bình', color: 'text-warning' },
  { id: 6, title: 'Review code sprint 5', date: '03/07/2026', priority: 'Cao', color: 'text-danger' },
  { id: 7, title: 'Lên kế hoạch marketing', date: '05/07/2026', priority: 'Trung bình', color: 'text-warning' },
  { id: 8, title: 'Viết tài liệu API', date: '06/07/2026', priority: 'Thấp', color: 'text-success' },
  { id: 9, title: 'Cập nhật thư viện React', date: '07/07/2026', priority: 'Trung bình', color: 'text-warning' },
  { id: 10, title: 'Fix bug giao diện', date: '08/07/2026', priority: 'Cao', color: 'text-danger' },
  { id: 11, title: 'Backup database', date: '09/07/2026', priority: 'Cao', color: 'text-danger' },
  { id: 12, title: 'Tối ưu hình ảnh', date: '10/07/2026', priority: 'Thấp', color: 'text-success' },
];

export default function UpcomingTasks() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(mockUpcoming.length / itemsPerPage);
  
  const currentItems = mockUpcoming.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-bold text-gray-900">Sắp đến hạn</h3>
        <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Xem tất cả &gt;</span>
      </div>
      
      <div className="flex flex-col gap-5 flex-1 justify-center">
        {currentItems.map(task => (
          <div key={task.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 group-hover:scale-110 transition-transform">
                <Clock size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{task.title}</h4>
                <span className="text-[10px] text-gray-500 mt-0.5 block">{task.date}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold bg-gray-50 px-2 py-1 rounded-md border border-gray-100 shrink-0 ${task.color}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-xs"
          >
            &lt;
          </button>
          <span className="text-xs text-gray-600 font-medium">{currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-xs"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
