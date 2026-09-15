import { supabase } from '@/lib/supabase';

/**
 * Khi 2 người vào chung phòng, gọi hàm này để checkin chuỗi học nhóm.
 * user1_id luôn nhỏ hơn user2_id để tránh duplicate (sort UID).
 */
export async function checkInCoStudy(myId: string, friendId: string, roomId: string) {
  // Sort để đảm bảo (A,B) và (B,A) đều map cùng 1 record
  const [u1, u2] = [myId, friendId].sort();

  const { error } = await supabase
    .from('co_study_checkins')
    .upsert(
      {
        user1_id: u1,
        user2_id: u2,
        room_id: roomId,
        checkin_date: new Date().toISOString().split('T')[0],
      },
      { onConflict: 'user1_id,user2_id,checkin_date' }
    );

  if (error) console.error('Co-study checkin error:', error);
}

/**
 * Tính chuỗi ngày học nhóm liên tiếp giữa 2 người
 */
export async function getCoStudyStreak(myId: string, friendId: string): Promise<number> {
  const [u1, u2] = [myId, friendId].sort();

  const { data, error } = await supabase
    .from('co_study_checkins')
    .select('checkin_date')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .order('checkin_date', { ascending: false })
    .limit(365);

  if (error || !data || data.length === 0) return 0;

  // Tính chuỗi liên tiếp từ hôm nay trở về trước
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkinDates = data.map((r) => {
    const d = new Date(r.checkin_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  let expected = today.getTime();

  for (const dateTs of checkinDates) {
    if (dateTs === expected) {
      streak++;
      expected -= 86400000; // trừ 1 ngày
    } else if (dateTs === expected - 86400000) {
      // Cho phép hôm qua (chưa checkin hôm nay)
      if (streak === 0) {
        streak++;
        expected = dateTs - 86400000;
      } else {
        break;
      }
    } else if (dateTs < expected) {
      break;
    }
  }

  return streak;
}

/**
 * Lấy lịch sử checkin của 1 cặp bạn bè (30 ngày gần nhất)
 */
export async function getCoStudyHistory(myId: string, friendId: string) {
  const [u1, u2] = [myId, friendId].sort();

  const { data } = await supabase
    .from('co_study_checkins')
    .select('checkin_date, room_id, created_at')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .order('checkin_date', { ascending: false })
    .limit(30);

  return data || [];
}
