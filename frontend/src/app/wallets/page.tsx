'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import WhiteStatCard from '@/components/shared/WhiteStatCard';
import WalletList from '@/components/wallets/WalletList';
import WalletDetailSidebar from '@/components/wallets/WalletDetailSidebar';
import { Wallet, PieChart, ArrowDown } from 'lucide-react';
import { mockSummary } from '@/lib/mockData';

export default function WalletsPage() {
  const [selectedWalletId, setSelectedWalletId] = useState(1);

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
          amount="8.750.000 đ"
          subtitle="Ví chính"
          icon={<Wallet size={24} />}
          iconBgColor="bg-indigo-500"
          iconTextColor="text-white"
          titleColor="text-indigo-500"
        />
        <WhiteStatCard 
          title="Số dư ban đầu"
          amount="15.000.000 đ"
          subtitle="Từ thu nhập đầu tháng"
          icon={<Wallet size={24} />}
          iconBgColor="bg-blue-500"
          iconTextColor="text-white"
          titleColor="text-blue-500"
        />
        <WhiteStatCard 
          title="Tổng chi trong tháng"
          amount="6.250.000 đ"
          subtitle="Đã sử dụng"
          icon={<ArrowDown size={24} />}
          iconBgColor="bg-red-500"
          iconTextColor="text-white"
          titleColor="text-red-500"
        />
        <WhiteStatCard 
          title="Ngân sách còn lại"
          amount="8.750.000 đ"
          subtitle="58% ngân sách"
          icon={<PieChart size={24} />}
          iconBgColor="bg-emerald-500"
          iconTextColor="text-white"
          titleColor="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="col-span-1 lg:col-span-2">
          <WalletList 
            selectedWalletId={selectedWalletId} 
            onSelectWallet={setSelectedWalletId} 
          />
        </div>
        <div className="col-span-1">
          <WalletDetailSidebar walletId={selectedWalletId} />
        </div>
      </div>
    </div>
  );
}
