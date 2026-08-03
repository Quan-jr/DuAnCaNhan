'use client';

import { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import WhiteStatCard from '@/components/shared/WhiteStatCard';
import TaskListExtended from '@/components/tasks/TaskListExtended';
import TaskSidebar from '@/components/tasks/TaskSidebar';
import { CheckSquare, RefreshCw, CheckCircle, Clock, X, Camera, Upload, Trash2, FileText, ShoppingCart, BookOpen, Activity, Monitor, Plane, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const statusToIdMap: Record<string, number> = {
  'Chưa làm': 1,
  'Đang làm': 2,
  'Hoàn thành': 3,
  'Tạm hoãn': 4,
  'Hủy bỏ': 5,
};

const idToStatusMap: Record<number, string> = {
  1: 'Chưa làm',
  2: 'Đang làm',
  3: 'Hoàn thành',
  4: 'Tạm hoãn',
  5: 'Hủy bỏ',
};

const priorityToIdMap: Record<string, number> = {
  'Thấp': 1,
  'Trung bình': 2,
  'Cao': 3,
  'Khẩn cấp': 4,
};

const idToPriorityMap: Record<number, string> = {
  1: 'Thấp',
  2: 'Trung bình',
  3: 'Cao',
  4: 'Khẩn cấp',
};

const getIconForTask = (title: string) => {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('học') || lowercaseTitle.includes('đọc')) return 'book-open';
  if (lowercaseTitle.includes('chợ') || lowercaseTitle.includes('mua')) return 'shopping-cart';
  if (lowercaseTitle.includes('gym') || lowercaseTitle.includes('tập')) return 'activity';
  if (lowercaseTitle.includes('bay') || lowercaseTitle.includes('vé')) return 'plane';
  if (lowercaseTitle.includes('báo cáo') || lowercaseTitle.includes('họp')) return 'monitor';
  return 'file-text';
};

const getColorForTask = (priorityId: number) => {
  switch (priorityId) {
    case 3: // Cao
    case 4: // Khẩn cấp
      return 'bg-rose-100 text-rose-600';
    case 2: // Trung bình
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-emerald-100 text-emerald-600';
  }
};

const availableIcons = [
  { name: 'file-text', icon: FileText, label: 'Tài liệu' },
  { name: 'shopping-cart', icon: ShoppingCart, label: 'Mua sắm' },
  { name: 'book-open', icon: BookOpen, label: 'Học tập' },
  { name: 'activity', icon: Activity, label: 'Sức khỏe' },
  { name: 'monitor', icon: Monitor, label: 'Công việc' },
  { name: 'plane', icon: Plane, label: 'Du lịch' },
  { name: 'calendar', icon: Calendar, label: 'Lịch trình' },
  { name: 'clock', icon: Clock, label: 'Thời gian' },
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return '30/06/2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '30/06/2026';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '30/06/2026';
  }
};

export default function TasksPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [filterPriority, setFilterPriority] = useState('Tất cả');
  const [filterDate, setFilterDate] = useState('');

  // Form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Trung bình');
  const [taskStatus, setTaskStatus] = useState('Chưa làm');
  const [taskImage, setTaskImage] = useState<string | null>(null);
  const [taskIcon, setTaskIcon] = useState('file-text');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_list')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        const mapped = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: idToStatusMap[t.id__status] || 'Chưa làm',
          priority: idToPriorityMap[t.id__priority] || 'Trung bình',
          checked: t.id__status === 3,
          date: formatDate(t.created_date),
          icon: t.icon || getIconForTask(t.title),
          color: getColorForTask(t.id__priority),
          image_url: t.photo,
        }));
        setTasks(mapped);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách công việc:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaskImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      alert('Vui lòng nhập tiêu đề công việc!');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('task_list')
        .insert([
          {
            title: taskTitle,
            description: taskDesc,
            id__status: statusToIdMap[taskStatus] || 1,
            id__priority: priorityToIdMap[taskPriority] || 2,
            photo: taskImage,
            icon: taskIcon,
          }
        ]);

      if (error) throw error;

      // Reset and close
      setTaskTitle('');
      setTaskDesc('');
      setTaskDate('');
      setTaskPriority('Trung bình');
      setTaskStatus('Chưa làm');
      setTaskImage(null);
      setTaskIcon('file-text');
      setIsAddModalOpen(false);

      // Reload list
      fetchTasks();
    } catch (error: any) {
      alert(`Lỗi khi lưu công việc vào DB: ${error.message}`);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus('Tất cả');
    setFilterPriority('Tất cả');
    setFilterDate('');
  };

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = searchQuery.trim() === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = filterStatus === 'Tất cả' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'Tất cả' || task.priority === filterPriority;
    
    let matchesDate = true;
    if (filterDate) {
      const [y, m, d] = filterDate.split('-');
      const formattedFilter = `${d}/${m}/${y}`;
      matchesDate = task.date === formattedFilter;
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  // Calculate statistics based on filtered tasks
  const totalTasks = filteredTasks.length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'Đang làm').length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Hoàn thành').length;
  const overdueTasks = filteredTasks.filter(t => t.status === 'Quá hạn').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quản lý công việc</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi, quản lý và hoàn thành công việc hiệu quả mỗi ngày.</p>
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              className="block w-full sm:w-40 pl-3 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm text-gray-900"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shrink-0"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Tất cả">Trạng thái</option>
            <option value="Chưa làm">Chưa làm</option>
            <option value="Đang làm">Đang làm</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Tạm hoãn">Tạm hoãn</option>
            <option value="Hủy bỏ">Hủy bỏ</option>
          </select>
          
          <select 
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shrink-0"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="Tất cả">Ưu tiên</option>
            <option value="Thấp">Thấp</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Cao">Cao</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
          </select>
          
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shrink-0"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          <div className="flex items-center gap-2 shrink-0">
            {(searchQuery || filterStatus !== 'Tất cả' || filterPriority !== 'Tất cả' || filterDate) && (
              <button 
                className="px-3 py-2 border border-red-200 text-red-500 rounded-xl bg-red-50 text-sm flex items-center gap-1.5 hover:bg-red-100 transition-colors"
                onClick={handleClearFilters}
                type="button"
              >
                Xóa bộ lọc
              </button>
            )}
            
            <button 
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
              onClick={() => setIsAddModalOpen(true)}
              type="button"
            >
              + Thêm công việc
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <WhiteStatCard 
          title="Tổng số task"
          amount={totalTasks.toString()}
          subtitle="Tất cả công việc"
          icon={<CheckSquare size={20} />}
          iconBgColor="bg-indigo-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Đang làm"
          amount={inProgressTasks.toString()}
          subtitle="Công việc đang thực hiện"
          icon={<RefreshCw size={20} />}
          iconBgColor="bg-blue-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Hoàn thành"
          amount={completedTasks.toString()}
          subtitle="Công việc đã hoàn thành"
          icon={<CheckCircle size={20} />}
          iconBgColor="bg-emerald-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
        <WhiteStatCard 
          title="Quá hạn"
          amount={overdueTasks.toString()}
          subtitle="Cần xử lý sớm"
          icon={<Clock size={20} />}
          iconBgColor="bg-red-500"
          iconTextColor="text-white"
          titleColor="text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
          <TaskListExtended tasks={filteredTasks} loading={loading} fetchTasks={fetchTasks} />
        </div>
        <div className="col-span-1 lg:col-span-5 xl:col-span-5">
          <TaskSidebar tasks={filteredTasks} />
        </div>
      </div>

      {/* Add Task Modal Form */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <form 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <button 
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Thêm công việc mới</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Tiêu đề công việc <span className="text-danger">*</span></label>
              <input 
                type="text"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                placeholder="Nhập tiêu đề công việc..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Biểu tượng công việc</label>
              <div className="grid grid-cols-4 gap-2">
                {availableIcons.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = taskIcon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm scale-102' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setTaskIcon(item.name)}
                    >
                      <IconComponent size={16} />
                      <span className="text-[9px] truncate w-full text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Mô tả chi tiết</label>
              <textarea 
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900 min-h-[80px] resize-none"
                placeholder="Nhập mô tả chi tiết công việc..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 font-medium">Trạng thái</label>
                <select 
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                >
                  <option value="Chưa làm">Chưa làm</option>
                  <option value="Đang làm">Đang làm</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 font-medium">Độ ưu tiên</label>
                <select 
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="Thấp">Thấp</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Cao">Cao</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Hạn chót</label>
              <input 
                type="date"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Hình ảnh đính kèm</label>
              <input 
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              
              {taskImage ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-32 group">
                  <img src={taskImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      type="button"
                      className="p-2 bg-white rounded-full text-danger hover:bg-danger hover:text-white transition-colors"
                      onClick={() => setTaskImage(null)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      type="button"
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border border-dashed border-gray-200 rounded-xl p-3 flex items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <Camera size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">Chụp ảnh hoặc Tải lên ảnh</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Cho phép tải từ máy hoặc chụp từ Camera</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button 
                type="button"
                className="flex-1 py-2.5 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                onClick={() => setIsAddModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                Lưu công việc
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
