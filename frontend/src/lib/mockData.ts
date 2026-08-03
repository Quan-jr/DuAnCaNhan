export const mockTasks = [
  { id: 1, title: 'Hoàn thành báo cáo dự án Q2', description: 'Tổng hợp số liệu và phân tích hiệu quả dự án quý 2', status: 'Đang làm', priority: 'Cao', date: '26/06/2026', checked: false, icon: 'file-text', color: 'bg-indigo-100 text-indigo-600' },
  { id: 2, title: 'Đi chợ mua thực phẩm', description: 'Mua rau củ, thịt cá, trứng và đồ dùng thiết yếu', status: 'Chưa làm', priority: 'Trung bình', date: '25/06/2026', checked: false, icon: 'shopping-cart', color: 'bg-orange-100 text-orange-600' },
  { id: 3, title: 'Học khóa học online', description: 'Hoàn thành bài học tuần 3 - Khóa UX/UI cơ bản', status: 'Đang làm', priority: 'Trung bình', date: '30/06/2026', checked: false, icon: 'book-open', color: 'bg-blue-100 text-blue-600' },
  { id: 4, title: 'Tập gym buổi sáng', description: 'Duy trì thói quen tập luyện 30 phút mỗi ngày', status: 'Hoàn thành', priority: 'Thấp', date: '27/06/2026', checked: true, icon: 'activity', color: 'bg-emerald-100 text-emerald-600' },
  { id: 5, title: 'Đọc sách 30 phút', description: 'Đọc sách phát triển bản thân', status: 'Chưa làm', priority: 'Thấp', date: '26/06/2026', checked: false, icon: 'book', color: 'bg-purple-100 text-purple-600' },
  { id: 6, title: 'Chuẩn bị bài thuyết trình', description: 'Chuẩn bị slide và nội dung cho buổi thuyết trình', status: 'Đang làm', priority: 'Cao', date: '29/06/2026', checked: false, icon: 'monitor', color: 'bg-gray-100 text-gray-600' },
  { id: 7, title: 'Đặt vé máy bay về quê', description: 'Đặt vé cho chuyến về quê cuối tuần', status: 'Chưa làm', priority: 'Trung bình', date: '28/06/2026', checked: false, icon: 'plane', color: 'bg-sky-100 text-sky-600' },
  { id: 8, title: 'Kiểm tra hệ thống backup', description: 'Sao lưu dữ liệu định kỳ và kiểm tra tính toàn vẹn', status: 'Chưa làm', priority: 'Cao', date: '01/07/2026', checked: false, icon: 'file-text', color: 'bg-red-100 text-red-600' },
  { id: 9, title: 'Họp định kỳ với team', description: 'Cập nhật tiến độ tuần và thảo luận khó khăn', status: 'Hoàn thành', priority: 'Trung bình', date: '29/06/2026', checked: true, icon: 'activity', color: 'bg-teal-100 text-teal-600' },
  { id: 10, title: 'Thiết kế banner sự kiện', description: 'Tạo các mẫu banner quảng bá cho chương trình mới', status: 'Đang làm', priority: 'Thấp', date: '02/07/2026', checked: false, icon: 'monitor', color: 'bg-pink-100 text-pink-600' },
];

export const mockTransactions = [
  { id: 1, title: 'Siêu thị WinMart', date: '25/06/2026', amount: -450000, type: 'expense', category: 'Sinh hoạt', icon: 'cart' },
  { id: 2, title: 'Tiền điện', date: '25/06/2026', amount: -650000, type: 'expense', category: 'Sinh hoạt', icon: 'zap' },
  { id: 3, title: 'Ăn uống', date: '24/06/2026', amount: -120000, type: 'expense', category: 'Ăn uống', icon: 'utensils' },
  { id: 4, title: 'Xăng xe', date: '24/06/2026', amount: -200000, type: 'expense', category: 'Đi lại', icon: 'fuel' },
  { id: 5, title: 'Cà phê', date: '23/06/2026', amount: -45000, type: 'expense', category: 'Giải trí', icon: 'coffee' },
];

export const mockEarnings = [
  { id: 1, title: 'Lương tháng 06/2026', date: '01/06/2026', amount: 15000000, type: 'Lương' },
  { id: 2, title: 'Thu nhập freelance', date: '15/06/2026', amount: 2000000, type: 'Freelance' },
  { id: 3, title: 'Lợi nhuận đầu tư', date: '20/06/2026', amount: 1200000, type: 'Freelance' },
  { id: 4, title: 'Bán đồ cũ', date: '22/06/2026', amount: 500000, type: 'Lương' },
];

export const mockBudgetDistribution = [
  { name: 'Sinh hoạt', value: 40, color: '#3b82f6' }, // blue
  { name: 'Ăn uống', value: 20, color: '#f59e0b' },  // yellow
  { name: 'Đi lại', value: 15, color: '#10b981' },   // green
  { name: 'Học tập', value: 15, color: '#ef4444' },  // red
  { name: 'Giải trí', value: 10, color: '#8b5cf6' }, // purple
];

export const mockSummary = {
  totalIncome: 15000000,
  currentBalance: 8750000,
  totalExpense: 6250000,
  totalTasks: 12,
  expenseRate: 41.67,
  savingGoal: 10000000,
  savedAmount: 6750000
};

export const mockWallets = [
  { id: 1, name: 'Ví chính', month: '06/2026', initialBalance: 15000000, currentBalance: 8750000, date: '26/06/2026', icon: 'wallet', color: 'bg-indigo-500' },
  { id: 2, name: 'Ví tiết kiệm', month: '06/2026', initialBalance: 5000000, currentBalance: 6200000, date: '26/06/2026', icon: 'piggy-bank', color: 'bg-rose-400' },
  { id: 3, name: 'Ví du lịch', month: '07/2026', initialBalance: 3000000, currentBalance: 2500000, date: '05/07/2026', icon: 'plane', color: 'bg-blue-400' },
  { id: 4, name: 'Ví khẩn cấp', month: '06/2026', initialBalance: 2000000, currentBalance: 2000000, date: '20/06/2026', icon: 'shield', color: 'bg-orange-400' },
];

export const mockInitialSources = [
  { id: 1, title: 'Lương tháng 06/2026', date: '01/06/2026', amount: 15000000, icon: 'briefcase' },
  { id: 2, title: 'Thưởng hiệu suất', date: '15/06/2026', amount: 1500000, icon: 'gift' },
  { id: 3, title: 'Freelance thiết kế', date: '18/06/2026', amount: 800000, icon: 'laptop' },
];
