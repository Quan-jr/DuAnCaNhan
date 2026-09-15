import GoogleCalendarView from '@/components/calendar/GoogleCalendarView';

export const metadata = {
  title: 'Lịch Biểu & Kế Hoạch - Quản lý cá nhân',
  description: 'Giao diện quản lý thời gian và lịch trình kiểu Google Calendar',
};

export default function CalendarPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5 lg:p-6 gap-4">

      <div className="flex-1 w-full flex flex-col min-h-0">
        <GoogleCalendarView />
      </div>
    </div>
  );
}
