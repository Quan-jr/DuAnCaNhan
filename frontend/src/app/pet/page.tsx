import PetGameScreen from '@/components/pet/PetGameScreen';

export const metadata = {
  title: 'Pet 3D - Quản lý Cá Nhân',
  description: 'Màn hình thú cưng Pet 3D tương tác phong cách RPG',
};

export default function PetPage() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50/50 p-4 sm:p-8 space-y-6">


      <div className="w-full max-w-6xl mx-auto">
        <PetGameScreen />
      </div>
    </div>
  );
}
