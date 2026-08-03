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
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Wallets joined with Earnings
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select(`
          id,
          budget_month,
          current_balance,
          transaction_date,
          earnings:initial_balance_id (
            amount,
            description
          )
        `)
        .order('id', { ascending: true });

      if (walletsError) throw walletsError;

      // 2. Fetch Earnings for balance sources list
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .order('salary_day', { ascending: false });

      if (earningsError) throw earningsError;

      if (walletsData) {
        const mappedWallets = walletsData.map((w: any) => ({
          id: w.id,
          name: w.earnings?.description || `Ví #${w.id}`,
          month: w.budget_month,
          initialBalance: w.earnings?.amount || 0,
          currentBalance: w.current_balance,
          date: formatDate(w.transaction_date),
          icon: getIconForWallet(w.earnings?.description || ''),
          color: getColorForWallet(w.id),
        }));
        setWallets(mappedWallets);
        
        if (mappedWallets.length > 0 && selectedWalletId === null) {
          setSelectedWalletId(mappedWallets[0].id);
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
