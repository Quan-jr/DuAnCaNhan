'use client';

import { useState, useEffect } from 'react';
import WhiteStatCard from '@/components/shared/WhiteStatCard';
import IncomeTableExtended from '@/components/earnings/IncomeTableExtended';
import IncomeSidebar from '@/components/earnings/IncomeSidebar';
import { supabase } from '@/lib/supabase';
import { Wallet, TrendingUp, DollarSign, Plus, X, Award, Calendar } from 'lucide-react';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};

const toIsoDateString = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

const toIsoMonthString = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  } catch {
    return '';
  }
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWallet, setFilterWallet] = useState('Tất cả');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Add/Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<number | null>(null);
  const [incDescription, setIncDescription] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incWalletId, setIncWalletId] = useState<string>('');
  const [incSalaryDay, setIncSalaryDay] = useState('');

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) {
        setWallets(data);
        if (data.length > 0 && !incWalletId) {
          setIncWalletId(data[0].id.toString());
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách ví:', err.message);
    }
  };

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('salary_day', { ascending: false });

      if (error) throw error;
      if (data) {
        // Map wallets
        const walletMap: Record<number, string> = {};
        wallets.forEach(w => {
          walletMap[w.id] = w.description || `Ví #${w.id}`;
        });

        const mapped = data.map((e: any) => ({
          id: e.id,
          title: e.description || 'Thu nhập',
          amount: Number(e.amount),
          date: formatDate(e.salary_day),
          rawDateStr: toIsoDateString(e.salary_day),
          rawMonthStr: toIsoMonthString(e.salary_day),
          id__wallet: e.id__wallet,
          wallet_name: walletMap[e.id__wallet] || (e.id__wallet ? `Ví #${e.id__wallet}` : 'Ví chính'),
          salary_day: e.salary_day
        }));
        setEarnings(mapped);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải thu nhập:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [wallets]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterWallet('Tất cả');
    setFilterMonth('');
    setFilterDate('');
  };

  // Filter logic
  const filteredEarnings = earnings.filter((e) => {
    const matchesSearch = searchQuery.trim() === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWallet = filterWallet === 'Tất cả' ||
      e.id__wallet?.toString() === filterWallet;

    let matchesDate = true;
    if (filterDate) {
      matchesDate = e.rawDateStr === filterDate;
    }

    let matchesMonth = true;
    if (filterMonth) {
      matchesMonth = e.rawMonthStr === filterMonth;
    }

    return matchesSearch && matchesWallet && matchesDate && matchesMonth;
  });

  // Calculate Statistics
  const totalIncomeSum = filteredEarnings.reduce((sum, e) => sum + Number(e.amount), 0);

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const thisMonthIncomeSum = filteredEarnings
    .filter(e => e.rawMonthStr === currentYearMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const highestEarning = filteredEarnings.length > 0
    ? [...filteredEarnings].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
    : null;

  const handleEditIncome = (item: any) => {
    setEditingIncomeId(item.id);
    setIncDescription(item.title);
    setIncAmount(item.amount.toString());
    setIncWalletId(item.id__wallet ? item.id__wallet.toString() : (wallets[0]?.id?.toString() || '1'));
    setIncSalaryDay(item.rawDateStr || '');
    setIsAddModalOpen(true);
  };

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDescription.trim()) {
      alert('Vui lòng nhập mô tả khoản thu nhập!');
      return;
    }

    const numericVal = parseFloat(incAmount);
    if (isNaN(numericVal) || numericVal <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    const dateToSave = incSalaryDay ? incSalaryDay : new Date().toISOString().split('T')[0];
    const walletIdNum = parseInt(incWalletId) || (wallets[0]?.id || 1);

    try {
      if (editingIncomeId) {
        const { error } = await supabase
          .from('earnings')
          .update({
            description: incDescription,
            amount: numericVal,
            salary_day: dateToSave,
            id__wallet: walletIdNum
          })
          .eq('id', editingIncomeId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('earnings')
          .insert([
            {
              description: incDescription,
              amount: numericVal,
              salary_day: dateToSave,
              id__wallet: walletIdNum
            }
          ]);

        if (error) throw error;

        // Optionally update current balance of targeted wallet
        const targetWallet = wallets.find(w => w.id === walletIdNum);
        if (targetWallet) {
          const updatedBal = Number(targetWallet.current_balance || 0) + numericVal;
          await supabase
            .from('wallets')
            .update({ current_balance: updatedBal })
            .eq('id', walletIdNum);
        }
      }

      // Reset modal
      setIsAddModalOpen(false);
      setEditingIncomeId(null);
      setIncDescription('');
      setIncAmount('');
      setIncSalaryDay('');

      // Reload
      fetchWallets();
      fetchEarnings();
    } catch (err: any) {
      alert(`Lỗi khi lưu thu nhập: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quản lý thu nhập</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi, thống kê và quản lý toàn bộ các nguồn thu nhập.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button 
            type="button"
            onClick={() => {
              setEditingIncomeId(null);
              setIncDescription('');
              setIncAmount('');
              setIncSalaryDay('');
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>+ Thêm thu nhập mới</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <WhiteStatCard 
          title="Tổng thu nhập"
          amount={`${totalIncomeSum.toLocaleString('vi-VN')} đ`}
          subtitle="Tất cả các khoản đã nhận"
          icon={<TrendingUp size={20} />}
          iconBgColor="bg-emerald-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Thu nhập tháng này"
          amount={`${thisMonthIncomeSum.toLocaleString('vi-VN')} đ`}
          subtitle="Thu nhập ghi nhận tháng hiện tại"
          icon={<Calendar size={20} />}
          iconBgColor="bg-blue-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Nguồn thu lớn nhất"
          amount={highestEarning ? `${Number(highestEarning.amount).toLocaleString('vi-VN')} đ` : '0 đ'}
          subtitle={highestEarning ? highestEarning.title : 'Chưa có dữ liệu'}
          icon={<Award size={20} />}
          iconBgColor="bg-amber-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Số khoản thu nhập"
          amount={filteredEarnings.length.toString()}
          subtitle="Tổng số bản ghi hiển thị"
          icon={<DollarSign size={20} />}
          iconBgColor="bg-indigo-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Detailed Income Table */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
          <IncomeTableExtended 
            earnings={filteredEarnings}
            loading={loading}
            fetchEarnings={fetchEarnings}
            onEdit={handleEditIncome}
          />
        </div>

        {/* Right Column: Sidebar Filter & Donut Chart */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-5">
          <IncomeSidebar 
            earnings={filteredEarnings}
            wallets={wallets}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterWallet={filterWallet}
            setFilterWallet={setFilterWallet}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onClearFilters={handleClearFilters}
            hasFilters={Boolean(searchQuery || filterWallet !== 'Tất cả' || filterDate || filterMonth)}
          />
        </div>
      </div>

      {/* Add / Edit Income Modal Form */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <form 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitIncome}
          >
            <button 
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {editingIncomeId ? 'Chỉnh sửa thu nhập' : 'Thêm thu nhập mới'}
            </h3>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Tên / Mô tả thu nhập <span className="text-emerald-600">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900"
                placeholder="Ví dụ: Lương tháng 8, Thưởng KPI, Freelance Web..."
                value={incDescription}
                onChange={(e) => setIncDescription(e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Số tiền nhận (đ) <span className="text-emerald-600">*</span></label>
              <input
                type="number"
                step="1000"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 font-bold"
                placeholder="Ví dụ: 15000000"
                value={incAmount}
                onChange={(e) => setIncAmount(e.target.value)}
                required
              />
            </div>

            {/* Wallet Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Cộng tiền vào ví</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900"
                value={incWalletId}
                onChange={(e) => setIncWalletId(e.target.value)}
              >
                {wallets.length === 0 ? (
                  <option value="1">Ví chính</option>
                ) : (
                  wallets.map((w) => (
                    <option key={w.id} value={w.id.toString()}>
                      {w.description || `Ví #${w.id}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Salary Receive Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Ngày nhận tiền</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900"
                value={incSalaryDay}
                onChange={(e) => setIncSalaryDay(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                onClick={() => setIsAddModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                {editingIncomeId ? 'Cập nhật' : 'Thêm thu nhập'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
