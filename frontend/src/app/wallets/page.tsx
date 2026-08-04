'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import WhiteStatCard from '@/components/shared/WhiteStatCard';
import WalletList from '@/components/wallets/WalletList';
import WalletDetailSidebar from '@/components/wallets/WalletDetailSidebar';
import InitialBalanceSources from '@/components/wallets/InitialBalanceSources';
import { Wallet, PieChart, ArrowDown, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

const getFallbackDescriptionForAmount = (amount: number) => {
  if (amount === -450000) return 'Siêu thị WinMart';
  if (amount === -650000) return 'Tiền điện';
  if (amount === -120000) return 'Ăn uống';
  if (amount === -200000) return 'Xăng xe';
  if (amount === -45000) return 'Cà phê';
  if (amount === -300000) return 'Mua sách';
  if (amount === -150000) return 'Đăng ký Netflix';
  if (amount === -500000) return 'Quà sinh nhật bạn';
  if (amount === -80000) return 'Trà sữa';
  if (amount === -1200000) return 'Mua giày mới';
  return amount < 0 ? 'Chi tiêu khác' : 'Thu nhập khác';
};

const getIconForWallet = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('tiết kiệm')) return 'piggy-bank';
  if (desc.includes('du lịch')) return 'plane';
  if (desc.includes('khẩn cấp')) return 'shield';
  return 'wallet';
};

const getColorForWallet = (id: number) => {
  const colors = [
    'bg-indigo-500',
    'bg-rose-400',
    'bg-blue-400',
    'bg-orange-400',
    'bg-emerald-500',
    'bg-purple-500',
  ];
  return colors[(id - 1) % colors.length];
};

export default function WalletsPage() {
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState('chi'); // 'thu' or 'chi'
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [txWalletId, setTxWalletId] = useState<number | null>(null);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletBudgetMonth, setWalletBudgetMonth] = useState(() => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  });
  const [walletInitialBalance, setWalletInitialBalance] = useState('');
  const [walletDate, setWalletDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleSubmitWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName || !walletBudgetMonth || !walletInitialBalance) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const balance = parseInt(walletInitialBalance.replace(/\D/g, ''), 10);

      // 1. Insert into earnings first to create the initial balance source
      const { data: earnData, error: earnErr } = await supabase.from('earnings').insert([
        {
          amount: balance,
          description: walletName,
          salary_day: walletDate,
        }
      ]).select();

      if (earnErr) throw earnErr;
      const newEarningId = earnData[0].id;

      // 2. Insert into wallets
      const { error: walletErr } = await supabase.from('wallets').insert([
        {
          budget_month: walletBudgetMonth,
          current_balance: balance,
          transaction_date: walletDate,
          initial_balance_id: newEarningId
        }
      ]);

      if (walletErr) throw walletErr;

      setIsWalletModalOpen(false);
      setWalletName('');
      setWalletInitialBalance('');
      
      fetchData();
    } catch (error: any) {
      alert('Lỗi khi thêm ví: ' + error.message);
    }
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDescription || !txWalletId) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      let finalAmount = parseInt(txAmount.replace(/\D/g, ''), 10);
      if (txType === 'chi') {
        finalAmount = -finalAmount; // Khoản chi là số âm
      }

      const { error } = await supabase.from('transactions').insert([
        {
          id__wallet: txWalletId,
          amount: finalAmount,
          description: txDescription,
          transaction_date: txDate,
        }
      ]);

      if (error) throw error;

      setIsTxModalOpen(false);
      setTxAmount('');
      setTxDescription('');
      
      // Refresh data to automatically recalculate current_balance
      fetchData();
    } catch (error: any) {
      alert('Lỗi khi thêm giao dịch: ' + error.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Wallets joined with Earnings (for name and initial balance)
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select(`
          id,
          budget_month,
          current_balance,
          transaction_date,
          initial_balance_id,
          earnings:initial_balance_id (
            amount,
            description
          )
        `)
        .order('id', { ascending: true });

      if (walletsError) throw walletsError;

      // 2. Fetch all Earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .order('salary_day', { ascending: false });

      if (earningsError) throw earningsError;

      // 3. Fetch all Transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*');
      
      if (txError) throw txError;

      let processedWallets: any[] = [];
      let currentSelectedWalletId = selectedWalletId;

      if (walletsData) {
        processedWallets = walletsData.map((w: any) => {
          const initialBalance = w.earnings?.amount || 0;
          const walletTx = txData?.filter((t: any) => t.id__wallet === w.id) || [];
          const txSum = walletTx.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          
          return {
            id: w.id,
            name: w.earnings?.description || `Ví #${w.id}`,
            month: w.budget_month,
            initialBalance: initialBalance,
            currentBalance: initialBalance + txSum,
            date: formatDate(w.transaction_date),
            icon: getIconForWallet(w.earnings?.description || ''),
            color: getColorForWallet(w.id),
            initial_balance_id: w.initial_balance_id,
          };
        });
        setWallets(processedWallets);
        
        if (processedWallets.length > 0 && currentSelectedWalletId === null) {
          setSelectedWalletId(processedWallets[0].id);
          currentSelectedWalletId = processedWallets[0].id;
        }
      }

      if (earningsData) {
        const mappedEarnings = earningsData.map((e: any) => ({
          id: e.id,
          title: e.description,
          date: formatDate(e.salary_day),
          amount: e.amount,
        }));
        setEarnings(mappedEarnings);
      }

      // Compute Ledger for selected wallet
      if (currentSelectedWalletId !== null) {
        const currentWallet = processedWallets.find(w => w.id === currentSelectedWalletId);
        
        const walletEarnings = earningsData?.filter((e: any) => 
          e.id__wallet === currentSelectedWalletId || e.id === currentWallet?.initial_balance_id
        ) || [];

        const walletTx = txData?.filter((t: any) => 
          t.id__wallet === currentSelectedWalletId
        ) || [];

        const computedLedger: any[] = [];
        walletEarnings.forEach((e: any) => {
          computedLedger.push({
            id: `ea-${e.id}`,
            type: 'income',
            title: e.description,
            amount: e.amount,
            dateStr: e.salary_day,
            dateObj: new Date(e.salary_day || 0)
          });
        });

        walletTx.forEach((t: any) => {
          computedLedger.push({
            id: `tx-${t.id}`,
            type: 'expense',
            title: t.description || getFallbackDescriptionForAmount(t.amount),
            amount: t.amount,
            dateStr: t.transaction_date,
            dateObj: new Date(t.transaction_date || 0)
          });
        });

        // Sort ascending by date to compute running balance
        computedLedger.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        let runningBalance = 0;
        const processedLedger = computedLedger.map(entry => {
          if (entry.type === 'income') {
            runningBalance += entry.amount;
          } else {
            runningBalance += entry.amount; // expense amounts are negative
          }
          return {
            ...entry,
            runningBalance,
            displayDate: formatDate(entry.dateStr)
          };
        });

        // Reverse for display (newest first)
        processedLedger.reverse();
        setLedger(processedLedger);
      }

    } catch (error: any) {
      console.error('Lỗi khi tải dữ liệu Ví/Thu nhập:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats dynamically
  const totalCurrentBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);
  const totalInitialBalance = wallets.reduce((sum, w) => sum + w.initialBalance, 0);
  const totalExpense = Math.max(0, totalInitialBalance - totalCurrentBalance);
  const remainingPercentage = totalInitialBalance > 0 
    ? Math.round((totalCurrentBalance / totalInitialBalance) * 100) 
    : 0;

  const activeWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quản lý ví</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi ngân sách, số dư và kế hoạch chi tiêu của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Thêm ví</span>
          </button>
          <button 
            onClick={() => {
              setTxWalletId(selectedWalletId || (wallets.length > 0 ? wallets[0].id : null));
              setIsTxModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Giao dịch mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <WhiteStatCard 
          title="Số dư hiện tại"
          amount={`${totalCurrentBalance.toLocaleString('vi-VN')} đ`}
          subtitle={activeWallet ? activeWallet.name : 'Tất cả các ví'}
          icon={<Wallet size={24} />}
          iconBgColor="bg-indigo-500"
          iconTextColor="text-white"
          titleColor="text-indigo-500"
        />
        <WhiteStatCard 
          title="Số dư ban đầu"
          amount={`${totalInitialBalance.toLocaleString('vi-VN')} đ`}
          subtitle="Từ nguồn thu nhập đầu tháng"
          icon={<Wallet size={24} />}
          iconBgColor="bg-blue-500"
          iconTextColor="text-white"
          titleColor="text-blue-500"
        />
        <WhiteStatCard 
          title="Tổng chi trong tháng"
          amount={`${totalExpense.toLocaleString('vi-VN')} đ`}
          subtitle="Đã sử dụng"
          icon={<ArrowDown size={24} />}
          iconBgColor="bg-red-500"
          iconTextColor="text-white"
          titleColor="text-red-500"
        />
        <WhiteStatCard 
          title="Ngân sách còn lại"
          amount={`${totalCurrentBalance.toLocaleString('vi-VN')} đ`}
          subtitle={`${remainingPercentage}% ngân sách`}
          icon={<PieChart size={24} />}
          iconBgColor="bg-emerald-500"
          iconTextColor="text-white"
          titleColor="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <WalletList 
            selectedWalletId={selectedWalletId || 1} 
            onSelectWallet={setSelectedWalletId} 
            wallets={wallets}
            ledger={ledger}
            loading={loading}
          />
          <InitialBalanceSources earnings={earnings} loading={loading} />
        </div>
        <div className="col-span-1">
          <WalletDetailSidebar walletId={selectedWalletId || 1} wallets={wallets} />
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsTxModalOpen(false)}
        >
          <form 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-5 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitTx}
          >
            <button 
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              onClick={() => setIsTxModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Thêm giao dịch mới</h3>

            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  txType === 'chi' ? 'bg-white text-danger shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTxType('chi')}
              >
                Chi tiêu (-)
              </button>
              <button
                type="button"
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  txType === 'thu' ? 'bg-white text-success shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTxType('thu')}
              >
                Thu nhập (+)
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Chọn ví <span className="text-danger">*</span></label>
              <select 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                value={txWalletId || ''}
                onChange={(e) => setTxWalletId(Number(e.target.value))}
                required
              >
                <option value="" disabled>-- Chọn ví --</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.currentBalance.toLocaleString('vi-VN')} đ)</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Số tiền <span className="text-danger">*</span></label>
              <div className="relative">
                <input 
                  type="text"
                  className={`w-full pl-3.5 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-white font-semibold ${txType === 'thu' ? 'text-success focus:border-success focus:ring-success/20' : 'text-danger focus:border-danger focus:ring-danger/20'}`}
                  placeholder="Ví dụ: 50000"
                  value={txAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setTxAmount(val ? Number(val).toLocaleString('vi-VN') : '');
                  }}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">đ</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Mô tả giao dịch <span className="text-danger">*</span></label>
              <input 
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                placeholder={txType === 'chi' ? 'Ví dụ: Mua bàn chải đánh răng...' : 'Ví dụ: Trả lương tháng...'}
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Ngày giao dịch <span className="text-danger">*</span></label>
              <input 
                type="date"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                required
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button 
                type="button"
                className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                onClick={() => setIsTxModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
              >
                Tạo giao dịch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Wallet Modal */}
      {isWalletModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsWalletModalOpen(false)}
        >
          <form 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-5 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitWallet}
          >
            <button 
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              onClick={() => setIsWalletModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Thêm ví / Quỹ mới</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Tên ví / Quỹ <span className="text-danger">*</span></label>
              <input 
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                placeholder="Ví dụ: Quỹ du lịch, Tiết kiệm..."
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Tháng ngân sách <span className="text-danger">*</span></label>
              <input 
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                placeholder="Ví dụ: 08/2026"
                value={walletBudgetMonth}
                onChange={(e) => setWalletBudgetMonth(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Số dư ban đầu <span className="text-danger">*</span></label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full pl-3.5 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 bg-white font-semibold text-gray-900"
                  placeholder="Ví dụ: 5000000"
                  value={walletInitialBalance}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setWalletInitialBalance(val ? Number(val).toLocaleString('vi-VN') : '');
                  }}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">đ</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Ngày tạo <span className="text-danger">*</span></label>
              <input 
                type="date"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                value={walletDate}
                onChange={(e) => setWalletDate(e.target.value)}
                required
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button 
                type="button"
                className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                onClick={() => setIsWalletModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
              >
                Tạo ví mới
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
