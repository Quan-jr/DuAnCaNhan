// Quản lý trạng thái Chuỗi học tập và Giữ chuỗi (Streak Freeze)

export interface DayProgress {
  dayName: string; // 'T2', 'T3', ...
  dayFull: string; // 'Thứ Hai', ...
  dayNumber: number;
  dateStr: string; // 'YYYY-MM-DD'
  isToday: boolean;
  isPast: boolean;
  status: 'completed' | 'frozen' | 'missed' | 'pending';
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  freezesRemaining: number;
  maxFreezes: number;
  isTodayCompleted: boolean;
  isTodayFrozen: boolean;
  history: Record<string, 'completed' | 'frozen'>;
  weeklyProgress: DayProgress[];
  lastActiveDate: string;
}

const STORAGE_KEY = 'study_streak_data_v1';
const STREAK_CHANGE_EVENT = 'study_streak_updated';

// Format YYYY-MM-DD theo local date
export const formatLocalDate = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Lấy thứ hai đầu tuần của một ngày
export const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Kiểm tra xem một task có phải thuộc nội dung học tập không
export const isLearningTask = (title: string = '', icon: string = ''): boolean => {
  if (icon === 'book-open' || icon === 'book') return true;
  const lower = title.toLowerCase();
  const keywords = ['học', 'đọc sách', 'bài giảng', 'khoá học', 'khóa học', 'ôn thi', 'luyện thi', 'english', 'tiếng anh', 'react', 'code', 'research', 'nghiên cứu', 'study'];
  return keywords.some(k => lower.includes(k));
};

// Khởi tạo dữ liệu mẫu ban đầu nếu chưa có trong localStorage
const getInitialData = (): {
  currentStreak: number;
  longestStreak: number;
  freezesRemaining: number;
  history: Record<string, 'completed' | 'frozen'>;
} => {
  const today = new Date();
  const history: Record<string, 'completed' | 'frozen'> = {};
  
  // Tạo dữ liệu cho 4 ngày trước đó để tạo cảm giác chuỗi học đang hoạt động tốt (ví dụ chuỗi 5 ngày)
  for (let i = 4; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    history[formatLocalDate(d)] = 'completed';
  }

  return {
    currentStreak: 4,
    longestStreak: 12,
    freezesRemaining: 2,
    history,
  };
};

// Đọc trạng thái hiện tại
export const getStreakState = (): StreakState => {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 4,
      longestStreak: 12,
      freezesRemaining: 2,
      maxFreezes: 3,
      isTodayCompleted: false,
      isTodayFrozen: false,
      history: {},
      weeklyProgress: [],
      lastActiveDate: formatLocalDate(),
    };
  }

  let raw = localStorage.getItem(STORAGE_KEY);
  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!data || !data.history) {
    data = getInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  const todayStr = formatLocalDate();
  const todayStatus = data.history[todayStr];
  const isTodayCompleted = todayStatus === 'completed';
  const isTodayFrozen = todayStatus === 'frozen';

  // Tính lịch tuần hiện tại (Thứ 2 đến Chủ Nhật)
  const today = new Date();
  const monday = getMonday(today);
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dayFullNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  const weeklyProgress: DayProgress[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    const dateStr = formatLocalDate(currentDay);
    
    // So sánh ngày
    const isToday = dateStr === todayStr;
    const isPast = currentDay.getTime() < today.setHours(0,0,0,0);
    
    let status: 'completed' | 'frozen' | 'missed' | 'pending' = 'pending';
    if (data.history[dateStr] === 'completed') {
      status = 'completed';
    } else if (data.history[dateStr] === 'frozen') {
      status = 'frozen';
    } else if (isPast) {
      status = 'missed';
    } else {
      status = 'pending';
    }

    weeklyProgress.push({
      dayName: dayNames[i],
      dayFull: dayFullNames[i],
      dayNumber: currentDay.getDate(),
      dateStr,
      isToday,
      isPast,
      status,
    });
  }

  return {
    currentStreak: data.currentStreak || 4,
    longestStreak: data.longestStreak || 12,
    freezesRemaining: data.freezesRemaining ?? 2,
    maxFreezes: 3,
    isTodayCompleted,
    isTodayFrozen,
    history: data.history || {},
    weeklyProgress,
    lastActiveDate: todayStr,
  };
};

// Phát event khi state thay đổi để các components cập nhật tức thì
const broadcastChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STREAK_CHANGE_EVENT));
  }
};

// Điểm danh học tập hôm nay
export const checkInTodayStudy = (forceComplete: boolean = false): StreakState => {
  const current = getStreakState();
  const todayStr = formatLocalDate();

  const newHistory = { ...current.history };
  const wasCompleted = newHistory[todayStr] === 'completed';
  const wasFrozen = newHistory[todayStr] === 'frozen';

  let newStreak = current.currentStreak;
  let newFreezes = current.freezesRemaining;

  if (wasCompleted) {
    if (forceComplete) {
      return current; // Nếu đã hoàn thành rồi và forceComplete = true thì không đổi (không toggle tắt)
    }
    // Bỏ tích hoàn thành
    delete newHistory[todayStr];
    newStreak = Math.max(0, newStreak - 1);
  } else {
    // Nếu trước đó đang bật freeze, khi học bài sẽ hoàn lại 1 lượt freeze
    if (wasFrozen) {
      newFreezes = Math.min(current.maxFreezes, newFreezes + 1);
    }
    newHistory[todayStr] = 'completed';
    newStreak += 1;
  }

  const newLongest = Math.max(current.longestStreak, newStreak);

  const payload = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    freezesRemaining: newFreezes,
    history: newHistory,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  broadcastChange();
  return getStreakState();
};

// Kích hoạt hoặc hủy "Giữ chuỗi học" (Streak Freeze) hôm nay
export const toggleTodayFreeze = (): { success: boolean; message: string; state: StreakState } => {
  const current = getStreakState();
  const todayStr = formatLocalDate();
  const newHistory = { ...current.history };

  // Nếu hôm nay đã học rồi thì không cần giữ chuỗi
  if (newHistory[todayStr] === 'completed') {
    return {
      success: false,
      message: 'Bạn đã hoàn thành bài học hôm nay rồi! Chuỗi học đã được ghi nhận an toàn.',
      state: current,
    };
  }

  // Nếu hôm nay đang freeze -> Hủy freeze và hoàn lại lượt
  if (newHistory[todayStr] === 'frozen') {
    delete newHistory[todayStr];
    const newFreezes = Math.min(current.maxFreezes, current.freezesRemaining + 1);

    const payload = {
      ...current,
      freezesRemaining: newFreezes,
      history: newHistory,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    broadcastChange();
    return {
      success: true,
      message: 'Đã hủy Giữ chuỗi hôm nay và hoàn lại 1 Khiên bảo vệ.',
      state: getStreakState(),
    };
  }

  // Muốn kích hoạt freeze mới
  if (current.freezesRemaining <= 0) {
    return {
      success: false,
      message: 'Bạn đã hết Khiên giữ chuỗi! Hãy hoàn thành nhiệm vụ học tập để nạp thêm khiên.',
      state: current,
    };
  }

  // Kích hoạt freeze: giảm 1 khiên, đánh dấu frozen
  newHistory[todayStr] = 'frozen';
  const newFreezes = Math.max(0, current.freezesRemaining - 1);

  const payload = {
    ...current,
    freezesRemaining: newFreezes,
    history: newHistory,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  broadcastChange();

  return {
    success: true,
    message: 'Đã kích hoạt Giữ chuỗi học thành công! Chuỗi ngày của bạn được bảo vệ an toàn hôm nay ❄️',
    state: getStreakState(),
  };
};

// Nạp thêm lượt khiên giữ chuỗi (phần thưởng)
export const addStreakFreeze = (count: number = 1): StreakState => {
  const current = getStreakState();
  const newFreezes = Math.min(current.maxFreezes, current.freezesRemaining + count);
  const payload = {
    ...current,
    freezesRemaining: newFreezes,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  broadcastChange();
  return getStreakState();
};

// Hook/Listener nhận cập nhật khi streak thay đổi
export const subscribeStreak = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(STREAK_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(STREAK_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};
