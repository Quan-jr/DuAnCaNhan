'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { Users, UserPlus, X, Search, Check, Video, Flame } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getCoStudyStreak } from '@/lib/coStudyStreak';

interface FriendListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendListSidebar({ isOpen, onClose }: FriendListSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [mounted, setMounted] = useState(false);
  
  // Data states
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [friendStreaks, setFriendStreaks] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      fetchFriends();
      fetchRequests();
    }
  }, [isOpen, user]);

  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    
    // Get friendships where status is 'accepted'
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        profiles!friendships_friend_id_fkey (id, email, full_name, avatar_url, status),
        profiles_as_user:profiles!friendships_user_id_fkey (id, email, full_name, avatar_url, status)
      `)
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
      
    if (!error && data) {
      // Map to get the *other* person's profile
      const mappedFriends = data.map((f: any) => {
        const isUserSender = f.user_id === user.id;
        const profile = isUserSender ? f.profiles : f.profiles_as_user;
        return { friendship_id: f.id, ...profile };
      });
      setFriends(mappedFriends);

      // Lấy streak học nhóm cho từng bạn bè
      const streakMap: Record<string, number> = {};
      await Promise.all(
        mappedFriends.map(async (friend: any) => {
          if (friend.id) {
            streakMap[friend.id] = await getCoStudyStreak(user.id, friend.id);
          }
        })
      );
      setFriendStreaks(streakMap);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    if (!user) return;
    
    // Get friendships where status is 'pending' AND friend_id is me (I am the receiver)
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        profiles!friendships_user_id_fkey (id, email, full_name, avatar_url)
      `)
      .eq('status', 'pending')
      .eq('friend_id', user.id);
      
    if (!error && data) {
      setRequests(data);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .ilike('email', `%${searchQuery}%`)
      .neq('id', user.id)
      .limit(10);
      
    if (!error && data) {
      setSearchResults(data);
    }
    setLoading(false);
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    setActionLoading(friendId);
    
    // Check if already friends or pending
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
      .single();
      
    if (existing) {
      alert('Đã gửi lời mời hoặc đã là bạn bè!');
      setActionLoading(null);
      return;
    }

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });
      
    if (!error) {
      alert('Đã gửi lời mời kết bạn!');
    } else {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
    setActionLoading(null);
  };

  const acceptRequest = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
      
    if (!error) {
      fetchRequests();
      fetchFriends();
    }
    setActionLoading(null);
  };

  const declineRequest = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
      
    if (!error) {
      fetchRequests();
    }
    setActionLoading(null);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div className="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Bạn bè & Học nhóm
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-1 bg-gray-50 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'friends' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Bạn bè
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors relative ${activeTab === 'requests' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Lời mời
            {requests.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'add' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Thêm bạn
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-sm text-gray-500 mt-4">Đang tải...</div>
              ) : friends.length === 0 ? (
                <div className="text-center flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Bạn chưa có người bạn nào.</p>
                  <p className="text-xs text-gray-400 mt-1 text-center">Thêm bạn bè để cùng nhau tập trung học và giữ chuỗi nhé!</p>
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-xl"
                  >
                    Tìm bạn bè ngay
                  </button>
                </div>
              ) : (
                friends.map((friend) => {
                  const streak = friendStreaks[friend.id] || 0;
                  return (
                  <div key={friend.friendship_id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.email}`} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{friend.full_name}</h4>
                      <p className="text-xs text-gray-500 truncate">{friend.email}</p>
                      {/* Co-study streak badge */}
                      {streak > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Flame size={11} className="text-orange-500 fill-orange-400" />
                          <span className="text-[11px] font-bold text-orange-500">{streak} ngày học cùng</span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        // Tạo roomID cố định dựa trên 2 user IDs để 2 người vào cùng phòng
                        const ids = [user?.id || '', friend.id].sort().join('-');
                        const roomID = `study-${ids.substring(0, 12)}`;
                        onClose();
                        // Truyền friendId để focus room có thể checkin streak
                        router.push(`/focus-room?roomID=${roomID}&friendId=${friend.id}`);
                      }}
                      className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                      title="Gọi Video Học Nhóm"
                    >
                      <Video size={16} />
                    </button>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center text-sm text-gray-500 mt-8">Không có lời mời nào.</div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="flex flex-col gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <img src={req.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.profiles.email}`} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{req.profiles.full_name}</h4>
                        <p className="text-xs text-gray-500">{req.profiles.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptRequest(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 flex items-center justify-center gap-1"
                      >
                        <Check size={14} /> Chấp nhận
                      </button>
                      <button 
                        onClick={() => declineRequest(req.id)}
                        disabled={actionLoading === req.id}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <X size={14} /> Từ chối
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div>
              <form onSubmit={handleSearch} className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Tìm theo email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <button type="submit" className="hidden">Tìm</button>
              </form>

              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-sm text-gray-500">Đang tìm kiếm...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div key={result.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-xs">
                      <img src={result.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.email}`} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{result.full_name}</h4>
                        <p className="text-[11px] text-gray-500 truncate">{result.email}</p>
                      </div>
                      <button 
                        onClick={() => sendFriendRequest(result.id)}
                        disabled={actionLoading === result.id}
                        className="p-2 bg-gray-50 text-gray-600 hover:bg-primary hover:text-white rounded-xl transition-colors"
                        title="Kết bạn"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="text-center text-sm text-gray-500 mt-4">Không tìm thấy người dùng nào.</div>
                ) : (
                  <div className="text-center text-sm text-gray-500 mt-4 flex flex-col items-center">
                    <Search size={32} className="text-gray-300 mb-2" />
                    Nhập email bạn bè của bạn để tìm kiếm
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
