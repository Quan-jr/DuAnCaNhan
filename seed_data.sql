-- ============================================================================
-- SCRIPT TẠO DỮ LIỆU MẪU (FAKE DATA) CHO SUPABASE
-- Bạn hãy copy toàn bộ nội dung này và chạy trong phần "SQL Editor" của Supabase
-- ============================================================================

-- 1. Xóa dữ liệu cũ (nếu có) để tránh lỗi trùng lặp khi chạy nhiều lần
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE wallets CASCADE;
TRUNCATE TABLE earnings CASCADE;
TRUNCATE TABLE task_list CASCADE;
TRUNCATE TABLE priority_task_list CASCADE;
TRUNCATE TABLE status_task_list CASCADE;

-- 2. Thêm dữ liệu cho Status Task List (Trạng thái công việc)
INSERT INTO status_task_list (id, name) VALUES 
(1, 'Chưa làm'),
(2, 'Đang làm'),
(3, 'Hoàn thành'),
(4, 'Tạm hoãn'),
(5, 'Hủy bỏ');

-- 3. Thêm dữ liệu cho Priority Task List (Độ ưu tiên)
INSERT INTO priority_task_list (id, name) VALUES 
(1, 'Thấp'),
(2, 'Trung bình'),
(3, 'Cao'),
(4, 'Khẩn cấp');

-- 4. Thêm 10 dòng cho Earnings (Thu nhập)
INSERT INTO earnings (id, amount, salary_day, description) VALUES 
(1, 15000000, '2026-06-01', 'Lương tháng 06/2026'),
(2, 2000000, '2026-06-15', 'Thu nhập freelance thiết kế website'),
(3, 5000000, '2026-06-20', 'Thưởng dự án quý 2'),
(4, 1000000, '2026-07-01', 'Lãi tiết kiệm ngân hàng'),
(5, 15000000, '2026-07-05', 'Lương tháng 07/2026'),
(6, 3000000, '2026-07-10', 'Bán đồ cũ trên mạng'),
(7, 4500000, '2026-07-18', 'Tiền thù lao tư vấn'),
(8, 15000000, '2026-08-01', 'Lương tháng 08/2026'),
(9, 1500000, '2026-08-12', 'Hoa hồng giới thiệu khách hàng'),
(10, 2500000, '2026-08-20', 'Dự án freelance nhỏ');

-- 5. Thêm 10 dòng cho Wallets (Ví/Ngân sách)
-- Dùng initial_balance_id liên kết với bảng earnings ở trên
INSERT INTO wallets (id, budget_month, initial_balance_id, current_balance, transaction_date) VALUES 
(1, '06/2026', 1, 8750000, '2026-06-30'),
(2, '06/2026', 2, 2000000, '2026-06-30'),
(3, '06/2026', 3, 5000000, '2026-06-30'),
(4, '07/2026', 4, 1000000, '2026-07-31'),
(5, '07/2026', 5, 12000000, '2026-07-31'),
(6, '07/2026', 6, 2500000, '2026-07-31'),
(7, '07/2026', 7, 4000000, '2026-07-31'),
(8, '08/2026', 8, 14000000, '2026-08-25'),
(9, '08/2026', 9, 1500000, '2026-08-25'),
(10, '08/2026', 10, 2500000, '2026-08-25');

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;

-- 6. Thêm 10 dòng cho Transactions (Giao dịch)
-- Liên kết với ví tháng 06/2026 (id_wallet = 1)
INSERT INTO transactions (id, id__wallet, amount, transaction_date, description) VALUES 
(1, 1, -450000, '2026-06-25', 'Siêu thị WinMart'),
(2, 1, -650000, '2026-06-25', 'Tiền điện'),
(3, 1, -120000, '2026-06-24', 'Ăn uống'),
(4, 1, -200000, '2026-06-24', 'Xăng xe'),
(5, 1, -45000, '2026-06-23', 'Cà phê'),
(6, 1, -300000, '2026-06-20', 'Mua sách'),
(7, 1, -150000, '2026-06-18', 'Đăng ký Netflix'),
(8, 1, -500000, '2026-06-15', 'Quà sinh nhật bạn'),
(9, 1, -80000, '2026-06-12', 'Trà sữa'),
(10, 1, -1200000, '2026-06-10', 'Mua giày mới');

-- 7. Thêm 10 dòng cho Task List (Danh sách công việc)
-- Liên kết với status (1-5) và priority (1-4)
INSERT INTO task_list (id, title, description, id__status, id__priority) VALUES 
(1, 'Hoàn thành báo cáo dự án', 'Báo cáo tổng kết dự án quý 2 cho sếp', 2, 3), -- Đang làm, Cao
(2, 'Đi chợ mua thực phẩm', 'Mua rau, thịt bò, cá cho cả tuần', 1, 2), -- Chưa làm, Trung bình
(3, 'Học khóa học online', 'Học phần React hooks trên Udemy', 2, 2), -- Đang làm, Trung bình
(4, 'Tập gym buổi sáng', 'Tập cardio và đẩy ngực', 3, 1), -- Hoàn thành, Thấp
(5, 'Đọc sách 30 phút', 'Đọc chương 3 cuốn Đắc Nhân Tâm', 1, 1), -- Chưa làm, Thấp
(6, 'Gửi email cho đối tác', 'Gửi báo giá hợp đồng mới', 4, 3), -- Tạm hoãn, Cao
(7, 'Thanh toán tiền điện nước', 'Hạn chót ngày 25 hàng tháng', 3, 4), -- Hoàn thành, Khẩn cấp
(8, 'Dọn dẹp phòng làm việc', 'Lau bàn, sắp xếp lại giấy tờ', 1, 1), -- Chưa làm, Thấp
(9, 'Lên kế hoạch du lịch', 'Tìm vé máy bay đi Đà Nẵng tháng sau', 2, 2), -- Đang làm, Trung bình
(10, 'Họp team tuần', 'Họp lúc 9h sáng thứ 2', 5, 3); -- Hủy bỏ, Cao

-- Reset sequence cho các bảng để tránh lỗi ID khi insert thêm mới sau này
SELECT setval(pg_get_serial_sequence('status_task_list', 'id'), coalesce(max(id),0) + 1, false) FROM status_task_list;
SELECT setval(pg_get_serial_sequence('priority_task_list', 'id'), coalesce(max(id),0) + 1, false) FROM priority_task_list;
SELECT setval(pg_get_serial_sequence('earnings', 'id'), coalesce(max(id),0) + 1, false) FROM earnings;
SELECT setval(pg_get_serial_sequence('wallets', 'id'), coalesce(max(id),0) + 1, false) FROM wallets;
SELECT setval(pg_get_serial_sequence('transactions', 'id'), coalesce(max(id),0) + 1, false) FROM transactions;
SELECT setval(pg_get_serial_sequence('task_list', 'id'), coalesce(max(id),0) + 1, false) FROM task_list;
