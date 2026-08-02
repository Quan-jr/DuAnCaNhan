import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ouopuewsyqrbarydlplp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ASOcFSk8K1RDmXIIctYp0A_LfrMBG5-';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const statusData = [
  { id: 1, name: 'Chưa làm' },
  { id: 2, name: 'Đang làm' },
  { id: 3, name: 'Hoàn thành' },
  { id: 4, name: 'Tạm hoãn' },
  { id: 5, name: 'Hủy bỏ' },
];

const priorityData = [
  { id: 1, name: 'Thấp' },
  { id: 2, name: 'Trung bình' },
  { id: 3, name: 'Cao' },
  { id: 4, name: 'Khẩn cấp' },
];

const earningsData = [
  { id: 1, amount: 15000000, salary_day: '2026-06-01', description: 'Lương tháng 06/2026' },
  { id: 2, amount: 2000000, salary_day: '2026-06-15', description: 'Thu nhập freelance thiết kế website' },
  { id: 3, amount: 5000000, salary_day: '2026-06-20', description: 'Thưởng dự án quý 2' },
  { id: 4, amount: 1000000, salary_day: '2026-07-01', description: 'Lãi tiết kiệm ngân hàng' },
  { id: 5, amount: 15000000, salary_day: '2026-07-05', description: 'Lương tháng 07/2026' },
  { id: 6, amount: 3000000, salary_day: '2026-07-10', description: 'Bán đồ cũ trên mạng' },
  { id: 7, amount: 4500000, salary_day: '2026-07-18', description: 'Tiền thù lao tư vấn' },
  { id: 8, amount: 15000000, salary_day: '2026-08-01', description: 'Lương tháng 08/2026' },
  { id: 9, amount: 1500000, salary_day: '2026-08-12', description: 'Hoa hồng giới thiệu khách hàng' },
  { id: 10, amount: 2500000, salary_day: '2026-08-20', description: 'Dự án freelance nhỏ' },
];

const walletsData = [
  { id: 1, budget_month: '06/2026', initial_balance_id: 1, current_balance: 8750000, transaction_date: '2026-06-30' },
  { id: 2, budget_month: '06/2026', initial_balance_id: 2, current_balance: 2000000, transaction_date: '2026-06-30' },
  { id: 3, budget_month: '06/2026', initial_balance_id: 3, current_balance: 5000000, transaction_date: '2026-06-30' },
  { id: 4, budget_month: '07/2026', initial_balance_id: 4, current_balance: 1000000, transaction_date: '2026-07-31' },
  { id: 5, budget_month: '07/2026', initial_balance_id: 5, current_balance: 12000000, transaction_date: '2026-07-31' },
  { id: 6, budget_month: '07/2026', initial_balance_id: 6, current_balance: 2500000, transaction_date: '2026-07-31' },
  { id: 7, budget_month: '07/2026', initial_balance_id: 7, current_balance: 4000000, transaction_date: '2026-07-31' },
  { id: 8, budget_month: '08/2026', initial_balance_id: 8, current_balance: 14000000, transaction_date: '2026-08-25' },
  { id: 9, budget_month: '08/2026', initial_balance_id: 9, current_balance: 1500000, transaction_date: '2026-08-25' },
  { id: 10, budget_month: '08/2026', initial_balance_id: 10, current_balance: 2500000, transaction_date: '2026-08-25' },
];

const transactionsData = [
  { id: 1, id__wallet: 1, amount: -450000, transaction_date: '2026-06-25' },
  { id: 2, id__wallet: 1, amount: -650000, transaction_date: '2026-06-25' },
  { id: 3, id__wallet: 1, amount: -120000, transaction_date: '2026-06-24' },
  { id: 4, id__wallet: 1, amount: -200000, transaction_date: '2026-06-24' },
  { id: 5, id__wallet: 1, amount: -45000, transaction_date: '2026-06-23' },
  { id: 6, id__wallet: 1, amount: -300000, transaction_date: '2026-06-20' },
  { id: 7, id__wallet: 1, amount: -150000, transaction_date: '2026-06-18' },
  { id: 8, id__wallet: 1, amount: -500000, transaction_date: '2026-06-15' },
  { id: 9, id__wallet: 1, amount: -80000, transaction_date: '2026-06-12' },
  { id: 10, id__wallet: 1, amount: -1200000, transaction_date: '2026-06-10' },
];

const tasksData = [
  { id: 1, title: 'Hoàn thành báo cáo dự án', description: 'Báo cáo tổng kết dự án quý 2 cho sếp', id__status: 2, id__priority: 3 },
  { id: 2, title: 'Đi chợ mua thực phẩm', description: 'Mua rau, thịt bò, cá cho cả tuần', id__status: 1, id__priority: 2 },
  { id: 3, title: 'Học khóa học online', description: 'Học phần React hooks trên Udemy', id__status: 2, id__priority: 2 },
  { id: 4, title: 'Tập gym buổi sáng', description: 'Tập cardio và đẩy ngực', id__status: 3, id__priority: 1 },
  { id: 5, title: 'Đọc sách 30 phút', description: 'Đọc chương 3 cuốn Đắc Nhân Tâm', id__status: 1, id__priority: 1 },
  { id: 6, title: 'Gửi email cho đối tác', description: 'Gửi báo giá hợp đồng mới', id__status: 4, id__priority: 3 },
  { id: 7, title: 'Thanh toán tiền điện nước', description: 'Hạn chót ngày 25 hàng tháng', id__status: 3, id__priority: 4 },
  { id: 8, title: 'Dọn dẹp phòng làm việc', description: 'Lau bàn, sắp xếp lại giấy tờ', id__status: 1, id__priority: 1 },
  { id: 9, title: 'Lên kế hoạch du lịch', description: 'Tìm vé máy bay đi Đà Nẵng tháng sau', id__status: 2, id__priority: 2 },
  { id: 10, title: 'Họp team tuần', description: 'Họp lúc 9h sáng thứ 2', id__status: 5, id__priority: 3 },
];

async function seedTable(tableName, data) {
  console.log(`Đang thêm dữ liệu vào bảng ${tableName}...`);
  // Use upsert to prevent errors if running multiple times
  const { error } = await supabase.from(tableName).upsert(data, { onConflict: 'id' });
  if (error) {
    console.error(`Lỗi bảng ${tableName}:`, error.message);
  } else {
    console.log(`=> Đã thêm thành công ${data.length} dòng vào ${tableName}`);
  }
}

async function run() {
  await seedTable('status_task_list', statusData);
  await seedTable('priority_task_list', priorityData);
  await seedTable('earnings', earningsData);
  await seedTable('wallets', walletsData);
  await seedTable('transactions', transactionsData);
  await seedTable('task_list', tasksData);
  console.log('--- HOÀN TẤT ---');
}

run();
