'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import WhiteStatCard from '@/components/shared/WhiteStatCard';
import WalletList from '@/components/wallets/WalletList';
import WalletDetailSidebar from '@/components/wallets/WalletDetailSidebar';
import InitialBalanceSources from '@/components/wallets/InitialBalanceSources';
import { Wallet, PieChart, ArrowDown } from 'lucide-react';
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
        processedWallets = walletsData.map((w: any) => ({
          id: w.id,
          name: w.earnings?.description || `Ví #${w.id}`,
          month: w.budget_month,
          initialBalance: w.earnings?.amount || 0,
          currentBalance: w.current_balance,
          date: formatDate(w.transaction_date),
          icon: getIconForWallet(w.earnings?.description || ''),
          color: getColorForWallet(w.id),
          initial_balance_id: w.initial_balance_id,
        }));
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
      <PageHeader 
        title="Quản lý ví" 
        subtitle="Theo dõi ngân sách, số dư và kế hoạch chi tiêu của bạn."
        buttonText="Thêm ví"
      />

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
    </div>
  );
}
