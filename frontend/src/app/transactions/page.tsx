import TransactionList from '@/components/TransactionList';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Giao dịch</h1>
          <p className="text-sm text-gray-500 mt-1">Lịch sử thu chi và biến động số dư của bạn.</p>
        </div>
      </div>
      
      <div className="w-full lg:w-2/3">
        <TransactionList />
      </div>
    </div>
  );
}
