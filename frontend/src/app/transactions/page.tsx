'use client';

import { useState, useEffect } from 'react';
import WhiteStatCard from '@/components/shared/WhiteStatCard';
import TransactionTableExtended from '@/components/transactions/TransactionTableExtended';
import TransactionSidebar from '@/components/transactions/TransactionSidebar';
import { supabase } from '@/lib/supabase';
import { Wallet, ArrowDown, ArrowUp, Plus, X, Receipt, CheckCircle, PieChart, DollarSign } from 'lucide-react';

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');
  const [filterWallet, setFilterWallet] = useState('Tất cả');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Add/Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txWalletId, setTxWalletId] = useState<string>('');
  const [txDate, setTxDate] = useState('');

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) {
        setWallets(data);
        if (data.length > 0 && !txWalletId) {
          setTxWalletId(data[0].id.toString());
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách ví:', err.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      if (data) {
        // Build wallet map
        const walletMap: Record<number, string> = {};
        wallets.forEach(w => {
          walletMap[w.id] = w.description || `Ví #${w.id}`;
        });

        const mapped = data.map((t: any) => ({
          id: t.id,
          title: t.description || 'Giao dịch',
          amount: Number(t.amount),
          date: formatDate(t.transaction_date),
          rawDateStr: toIsoDateString(t.transaction_date),
          rawMonthStr: toIsoMonthString(t.transaction_date),
          id__wallet: t.id__wallet,
          wallet_name: walletMap[t.id__wallet] || (t.id__wallet ? `Ví #${t.id__wallet}` : 'Ví chính'),
          created_at: t.created_at,
          transaction_date: t.transaction_date
        }));
        setTransactions(mapped);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải giao dịch:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [wallets]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('Tất cả');
    setFilterWallet('Tất cả');
    setFilterMonth('');
    setFilterDate('');
  };

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'Tất cả' ||
      (filterType === 'Thu nhập' && t.amount >= 0) ||
      (filterType === 'Chi tiêu' && t.amount < 0);

    const matchesWallet = filterWallet === 'Tất cả' ||
      t.id__wallet?.toString() === filterWallet;

    let matchesDate = true;
    if (filterDate) {
      matchesDate = t.rawDateStr === filterDate;
    }

    let matchesMonth = true;
    if (filterMonth) {
      matchesMonth = t.rawMonthStr === filterMonth;
    }

    return matchesSearch && matchesType && matchesWallet && matchesDate && matchesMonth;
  });

  // Calculate statistics
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const netBalance = totalIncome - totalExpense;

  const handleEditTx = (tx: any) => {
    setEditingTxId(tx.id);
    setTxDescription(tx.title);
    setTxAmount(Math.abs(tx.amount).toString());
    setTxType(tx.amount >= 0 ? 'income' : 'expense');
    setTxWalletId(tx.id__wallet ? tx.id__wallet.toString() : (wallets[0]?.id?.toString() || '1'));
    setTxDate(tx.rawDateStr || '');
    setIsAddModalOpen(true);
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription.trim()) {
      alert('Vui lòng nhập mô tả giao dịch!');
      return;
    }

    const numericVal = parseFloat(txAmount);
    if (isNaN(numericVal) || numericVal <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    const finalAmount = txType === 'expense' ? -Math.abs(numericVal) : Math.abs(numericVal);
    const dateToSave = txDate ? txDate : new Date().toISOString().split('T')[0];

    try {
      if (editingTxId) {
        const { error } = await supabase
          .from('transactions')
          .update({
            description: txDescription,
            amount: finalAmount,
            id__wallet: parseInt(txWalletId) || (wallets[0]?.id || 1),
            transaction_date: dateToSave
          })
          .eq('id', editingTxId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([
            {
              description: txDescription,
              amount: finalAmount,
              id__wallet: parseInt(txWalletId) || (wallets[0]?.id || 1),
              transaction_date: dateToSave
            }
          ]);

        if (error) throw error;
      }

      // Reset modal
      setIsAddModalOpen(false);
      setEditingTxId(null);
      setTxDescription('');
      setTxAmount('');
      setTxType('expense');
      setTxDate('');

      // Reload
      fetchTransactions();
    } catch (err: any) {
      alert(`Lỗi khi lưu giao dịch: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quản lý giao dịch</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi chi tiết tất cả biến động số dư và lịch sử thu chi.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button 
            type="button"
            onClick={() => {
              setEditingTxId(null);
              setTxDescription('');
              setTxAmount('');
              setTxType('expense');
              setTxDate('');
              setIsAddModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>+ Thêm giao dịch</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <WhiteStatCard 
          title="Tổng thu nhập"
          amount={`${totalIncome.toLocaleString('vi-VN')} đ`}
          subtitle="Khoản thu nhập đã ghi nhận"
          icon={<ArrowUp size={20} />}
          iconBgColor="bg-emerald-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Tổng chi tiêu"
          amount={`${totalExpense.toLocaleString('vi-VN')} đ`}
          subtitle="Khoản chi tiêu đã ghi nhận"
          icon={<ArrowDown size={20} />}
          iconBgColor="bg-rose-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Dòng tiền thuần"
          amount={`${netBalance.toLocaleString('vi-VN')} đ`}
          subtitle="Chênh lệch thu chi"
          icon={<DollarSign size={20} />}
          iconBgColor={netBalance >= 0 ? "bg-blue-500" : "bg-orange-500"}
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Tổng giao dịch"
          amount={filteredTransactions.length.toString()}
          subtitle="Số bản ghi hiển thị"
          icon={<Receipt size={20} />}
          iconBgColor="bg-indigo-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transactions List Table */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
          <TransactionTableExtended 
            transactions={filteredTransactions}
            loading={loading}
            fetchTransactions={fetchTransactions}
            onEdit={handleEditTx}
          />
        </div>

        {/* Right Column: Sidebar Filter & Analysis */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-5">
          <TransactionSidebar 
            transactions={filteredTransactions}
            wallets={wallets}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterWallet={filterWallet}
            setFilterWallet={setFilterWallet}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onClearFilters={handleClearFilters}
            hasFilters={Boolean(searchQuery || filterType !== 'Tất cả' || filterWallet !== 'Tất cả' || filterDate || filterMonth)}
          />
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <form 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitTx}
          >
            <button 
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {editingTxId ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
            </h3>

            {/* Type selector (Thu nhập vs Chi tiêu) */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  txType === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setTxType('expense')}
              >
                Chi tiêu (-)
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  txType === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setTxType('income')}
              >
                Thu nhập (+)
              </button>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Mô tả giao dịch <span className="text-rose-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                placeholder="Ví dụ: Siêu thị WinMart, Tiền nhà, Thưởng quý..."
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Số tiền (đ) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                step="1000"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 font-bold"
                placeholder="Ví dụ: 500000"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                required
              />
            </div>

            {/* Wallet Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Ví liên kết</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                value={txWalletId}
                onChange={(e) => setTxWalletId(e.target.value)}
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

            {/* Transaction Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Ngày giao dịch</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
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
                className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
              >
                {editingTxId ? 'Cập nhật' : 'Thêm giao dịch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
