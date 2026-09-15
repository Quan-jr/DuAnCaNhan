import { NextResponse } from 'next/server';

export interface GeneratedEvent {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: 'work' | 'study' | 'personal' | 'pomodoro';
  color: string;
  description?: string;
}

// Intelligent Natural Language Schedule Generator Fallback
function parsePromptLocally(prompt: string, baseDateStr?: string): GeneratedEvent[] {
  const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
  const lower = prompt.toLowerCase();
  const events: GeneratedEvent[] = [];

  // Helper to format date YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get days of the current week starting from Monday
  const dayOfWeek = baseDate.getDay();
  const mondayDiff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(baseDate);
  monday.setDate(mondayDiff);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  // Check intent types in prompt:
  const isStudy = /học|ôn|tiếng anh|ielts|lập trình|code|reading|writing/i.test(lower);
  const isWork = /làm việc|họp|meeting|dự án|project|báo cáo|deadline|công việc/i.test(lower);
  const isGym = /gym|thể dục|chạy bộ|workout|yoga/i.test(lower);
  const isPomodoro = /pomodoro|tập trung|focus/i.test(lower);

  // If prompt mentions week or everyday
  const isEveryday = /mỗi ngày|hàng ngày|cả tuần|trong tuần|tuần này/i.test(lower);
  const targetDays = isEveryday ? weekDays.slice(0, 5) : [baseDate];

  // 1. Study block
  if (isStudy || (!isWork && !isGym && !isPomodoro)) {
    const titleMatch = prompt.match(/học\s+([^\,\.\n]+)/i);
    const title = titleMatch ? `Học ${titleMatch[1].trim()}` : (isStudy ? 'Ôn tập & Tự học' : 'Phiên Học Tập Chuyên Sâu');
    
    targetDays.forEach((day, idx) => {
      events.push({
        title: idx === 0 ? title : `${title} (Buổi ${idx + 1})`,
        date: formatDate(day),
        startTime: '08:30',
        endTime: '10:30',
        category: 'study',
        color: '#9333ea',
        description: 'Phiên học tập trung năng suất cao được AI sắp xếp',
      });
    });
  }

  // 2. Work / Meeting block
  if (isWork) {
    const workTitleMatch = prompt.match(/họp\s+([^\,\.\n]+)/i) || prompt.match(/làm\s+([^\,\.\n]+)/i);
    const workTitle = workTitleMatch ? workTitleMatch[0] : 'Làm việc & Xử lý Dự án';

    targetDays.forEach((day) => {
      events.push({
        title: workTitle,
        date: formatDate(day),
        startTime: '14:00',
        endTime: '16:30',
        category: 'work',
        color: '#3b82f6',
        description: 'Nhiệm vụ công việc trọng tâm trong ngày',
      });
    });
  }

  // 3. Pomodoro block
  if (isPomodoro) {
    targetDays.forEach((day) => {
      events.push({
        title: 'Pomodoro Focus Session 🍅',
        date: formatDate(day),
        startTime: '10:45',
        endTime: '11:45',
        category: 'pomodoro',
        color: '#f43f5e',
        description: 'Tập trung học sâu và chăm sóc Pet 3D',
      });
    });
  }

  // 4. Gym / Personal health block
  if (isGym || lower.includes('tối')) {
    targetDays.forEach((day) => {
      events.push({
        title: isGym ? 'Tập Gym & Thể Lực 💪' : 'Thời gian cá nhân & Nghỉ ngơi',
        date: formatDate(day),
        startTime: '18:00',
        endTime: '19:15',
        category: 'personal',
        color: '#10b981',
        description: 'Rèn luyện sức khỏe và cân bằng cuộc sống',
      });
    });
  }

  // Fallback if nothing matched
  if (events.length === 0) {
    events.push(
      {
        title: 'Nhiệm vụ: ' + prompt.slice(0, 30),
        date: formatDate(baseDate),
        startTime: '09:00',
        endTime: '11:00',
        category: 'study',
        color: '#9333ea',
        description: prompt,
      },
      {
        title: 'Review & Đánh giá kết quả',
        date: formatDate(baseDate),
        startTime: '15:00',
        endTime: '16:00',
        category: 'work',
        color: '#3b82f6',
        description: 'Đánh giá tiến độ công việc',
      }
    );
  }

  return events;
}

export async function POST(req: Request) {
  try {
    const { prompt, baseDate } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Vui lòng cung cấp prompt' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API key is configured, call Gemini 2.5 Flash API
    if (apiKey) {
      try {
        const today = baseDate ? new Date(baseDate) : new Date();
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayOfWeekStr = days[today.getDay()];
        const todayStr = today.toISOString().split('T')[0];

        const systemPrompt = `Bạn là một trợ lý AI thông minh xuất sắc về lập lịch trình và quản lý thời gian trên Google Calendar.
Nhiệm vụ của bạn là đọc yêu cầu bằng ngôn ngữ tự nhiên của người dùng và tạo ra danh sách các sự kiện lịch trình CHÍNH XÁC theo ý họ.

THÔNG TIN THỜI GIAN HIỆN TẠI LÀM MỐC:
- Ngày mốc: ${todayStr} (${dayOfWeekStr}).
- Khi người dùng nói "thứ 2", "thứ 3", "ngày mai", "cả tuần này", hãy tính toán ngày (YYYY-MM-DD) chính xác tương ứng.
- Giờ định dạng 24h (HH:mm) ví dụ "08:30", "14:00", "18:00".
- Phân loại category:
  * "study": học tập, đọc sách, nghiên cứu, IELTS, code... (color: "#9333ea")
  * "work": công việc, họp hành, gặp khách hàng, deadline... (color: "#3b82f6")
  * "pomodoro": phiên tập trung sâu Pomodoro... (color: "#f43f5e")
  * "personal": gym, thể thao, nghỉ ngơi, gia đình, sở thích... (color: "#10b981")

QUY TẮC BẮT BUỘC:
Trả về DUY NHẤT một JSON hợp lệ theo định dạng sau:
{
  "events": [
    {
      "title": "Tên sự kiện ngắn gọn, đúng trọng tâm",
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "category": "work" | "study" | "personal" | "pomodoro",
      "color": "#3b82f6" | "#9333ea" | "#10b981" | "#f43f5e",
      "description": "Ghi chú ngắn về mục tiêu sự kiện"
    }
  ]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: systemPrompt },
                    { text: `Yêu cầu lập lịch: "${prompt}"` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (res.ok) {
          const data = await res.json();
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawText) {
            rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed.events) && parsed.events.length > 0) {
              return NextResponse.json({
                success: true,
                source: 'gemini-2.5-flash',
                events: parsed.events
              });
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('Gemini API returned error status:', res.status, errData);
        }
      } catch (geminiError) {
        console.warn('Gemini API call error, falling back to local NLP parser:', geminiError);
      }
    }

    // High performance local NLP parser fallback
    const localEvents = parsePromptLocally(prompt, baseDate);
    return NextResponse.json({
      success: true,
      source: 'local-ai-engine',
      events: localEvents
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Lỗi xử lý tạo thời gian biểu AI' },
      { status: 500 }
    );
  }
}
