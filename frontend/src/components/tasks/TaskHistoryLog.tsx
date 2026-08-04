'use client';

import { History, CheckCircle2, Clock, PlayCircle, PlusCircle, AlertTriangle } from 'lucide-react';

interface TaskHistoryLogProps {
  tasks: any[];
}

export default function TaskHistoryLog({ tasks }: TaskHistoryLogProps) {
  // Generate activity timeline from tasks
  const activities = tasks.slice(0, 4).map((t, idx) => {
    let action = 'Cập nhật công việc';
    let icon = Clock;
    let iconBg = 'bg-blue-50 text-blue-600';

    if (t.status === 'Hoàn thành') {
      action = 'Đã hoàn thành công việc';
      icon = CheckCircle2;
      iconBg = 'bg-emerald-50 text-emerald-600';
    } else if (t.status === 'Đang làm') {
      action = 'Đang tiến hành thực hiện';
      icon = PlayCircle;
      iconBg = 'bg-primary/10 text-primary';
    } else if (t.priority === 'Cao') {
      action = 'Ưu tiên khẩn cấp';
      icon = AlertTriangle;
      iconBg = 'bg-rose-50 text-rose-600';
    } else {
      action = 'Đã thêm mới vào danh sách';
      icon = PlusCircle;
      iconBg = 'bg-purple-50 text-purple-600';
    }

    return {
      id: t.id || idx,
      title: t.title,
      action,
      time: t.date || 'Hôm nay',
      icon,
      iconBg,
      status: t.status,
      priority: t.priority
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <History size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Lịch sử cập nhật gần đây</h3>
            <p className="text-[11px] text-gray-500">Dòng thời gian hoạt động công việc</p>
          </div>
        </div>
        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
          Tự động ghi nhận
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {activities.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">Chưa có lịch sử hoạt động.</p>
        ) : (
          activities.map((act) => {
            const IconComponent = act.icon;
            return (
              <div 
                key={act.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.iconBg}`}>
                    <IconComponent size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate">
                      {act.action}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400 whitespace-nowrap hidden sm:inline-block">
                    {act.time}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                    {act.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
