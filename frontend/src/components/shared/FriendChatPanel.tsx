'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { Send, Image as ImageIcon, CheckCircle2, Circle, Target, Users, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

interface RoomParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isHost?: boolean;
}

interface StudyTask {
  id: number;
  name: string;
  id__status: number;
}

interface FriendChatPanelProps {
  roomID: string;
  onParticipantCountChange?: (count: number) => void;
}

export default function FriendChatPanel({ roomID, onParticipantCountChange }: FriendChatPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'participants'>('messages');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [realParticipants, setRealParticipants] = useState<RoomParticipant[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Bạn';
  const userAvatar = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  // 1. Load real messages from localStorage for this specific roomID
  useEffect(() => {
    if (!roomID) return;
    const stored = localStorage.getItem(`chat_room_${roomID}`);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [roomID]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. Fetch real user tasks from Supabase `task_list`
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const { data, error } = await supabase
          .from('task_list')
          .select('id, name, id__status')
          .eq('user_id', user.id)
          .order('id', { ascending: false })
          .limit(4);

        if (!error && data) {
          setStudyTasks(data);
        }
      } catch (err) {
        console.error('Error fetching tasks for room:', err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [user]);

  // 3. Supabase Realtime Channel: Presence (Ai đang trong phòng) + Broadcast (Nhắn tin)
  useEffect(() => {
    if (!roomID || !user) return;

    const channel = supabase.channel(`study_room_${roomID}`, {
      config: {
        presence: { key: user.id },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const activeUsers: RoomParticipant[] = [];

        Object.keys(presenceState).forEach((key) => {
          const presences = presenceState[key] as any[];
          if (presences && presences.length > 0) {
            const p = presences[0];
            activeUsers.push({
              id: key,
              name: p.name || 'Học sinh',
              avatar: p.avatar,
              isOnline: true,
              isHost: key === user.id,
            });
          }
        });

        // Đảm bảo có ít nhất bản thân
        if (!activeUsers.some((u) => u.id === user.id)) {
          activeUsers.unshift({
            id: user.id,
            name: userName,
            avatar: userAvatar,
            isOnline: true,
            isHost: true,
          });
        }

        setRealParticipants(activeUsers);
        onParticipantCountChange?.(activeUsers.length);
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          const updated = [...prev, payload as ChatMessage];
          localStorage.setItem(`chat_room_${roomID}`, JSON.stringify(updated.slice(-100)));
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: userName,
            avatar: userAvatar,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomID, user, userName, userAvatar, onParticipantCountChange]);

  // Send real message
  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: user.id,
      user_name: userName,
      user_avatar: userAvatar,
      content: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, msg];
      localStorage.setItem(`chat_room_${roomID}`, JSON.stringify(updated.slice(-100)));
      return updated;
    });

    setInputText('');

    await supabase.channel(`study_room_${roomID}`).send({
      type: 'broadcast',
      event: 'chat',
      payload: msg,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle real task status
  const toggleTaskStatus = async (taskId: number, currentStatus: number) => {
    const newStatus = currentStatus === 3 ? 1 : 3;
    setStudyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, id__status: newStatus } : t))
    );

    try {
      await supabase
        .from('task_list')
        .update({ id__status: newStatus })
        .eq('id', taskId);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const completedCount = studyTasks.filter((t) => t.id__status === 3).length;
  const progressPercent = studyTasks.length > 0 ? Math.round((completedCount / studyTasks.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-[#f4f7fe] rounded-[2rem] p-3.5 shadow-sm border border-white/60">
      {/* ── Top Switcher: Pill Tabs (Messages / Participant) ── */}
      <div className="flex items-center bg-[#e4ebf8] p-1 rounded-2xl mb-3.5">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'messages'
              ? 'bg-[#c9d8f6] text-[#1e3a78] shadow-xs'
              : 'text-[#6b7c9e] hover:text-[#1e3a78]'
          }`}
        >
          Messages ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'participants'
              ? 'bg-[#c9d8f6] text-[#1e3a78] shadow-xs'
              : 'text-[#6b7c9e] hover:text-[#1e3a78]'
          }`}
        >
          Participant ({realParticipants.length || 1})
        </button>
      </div>

      {/* ── Main Tab Content ── */}
      {activeTab === 'messages' ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Real Study Goals Widget (Mục tiêu học tập thật từ task_list) */}
          <div className="bg-[#1b357d] text-white p-3.5 rounded-2xl shadow-md mb-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Target size={13} className="text-blue-300" />
                <h4 className="text-xs font-bold tracking-wide">Mục tiêu học tập buổi này</h4>
              </div>
              <span className="text-[10px] font-bold text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#29489a] h-1.5 rounded-full overflow-hidden mb-2.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Real Tasks List */}
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {studyTasks.length === 0 ? (
                <p className="text-[11px] text-blue-200/70 italic">
                  Chưa có nhiệm vụ nào. Thêm bài tập trong phần Nhiệm vụ!
                </p>
              ) : (
                studyTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task.id, task.id__status)}
                    className="flex items-center gap-2 text-[11px] text-blue-100 hover:text-white cursor-pointer py-0.5 group"
                  >
                    {task.id__status === 3 ? (
                      <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle size={13} className="text-blue-300/70 group-hover:text-blue-200 flex-shrink-0" />
                    )}
                    <span className={`truncate ${task.id__status === 3 ? 'line-through text-blue-300/60' : ''}`}>
                      {task.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Divider Label */}
          <div className="flex items-center gap-2 my-1 flex-shrink-0 px-1">
            <div className="h-px bg-[#d6e0f5] flex-1" />
            <span className="text-[11px] font-medium text-[#7c8ea8]">Messages</span>
            <div className="h-px bg-[#d6e0f5] flex-1" />
          </div>

          {/* Messages List */}
          <div
            className="flex-1 overflow-y-auto space-y-3 py-2 pr-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 px-2">
                <div className="w-10 h-10 rounded-2xl bg-[#e4ebf8] flex items-center justify-center mb-2">
                  <MessageSquare size={18} className="text-[#3b5cb8]" />
                </div>
                <p className="text-xs font-semibold text-[#1e3a78]">Phòng học trực tuyến</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                  Chưa có tin nhắn nào. Hãy gửi lời chào đến bạn bè cùng học!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.user_id === user?.id;

                if (isMe) {
                  return (
                    <div key={msg.id} className="flex flex-col items-end pl-6">
                      <span className="text-[10px] text-[#93a2bd] font-medium mr-2 mb-0.5">You</span>
                      <div className="bg-[#e4ebf8] text-[#1b2b4f] px-3.5 py-2.5 rounded-2xl rounded-tr-xs text-xs shadow-2xs font-normal leading-relaxed max-w-[90%]">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex items-start gap-2.5 max-w-[92%]">
                    <img
                      src={msg.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_name}`}
                      alt={msg.user_name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 shadow-2xs bg-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-medium ml-1 mb-0.5">{msg.user_name}</span>
                      <div className="bg-white text-[#222f4c] px-3.5 py-2.5 rounded-2xl rounded-tl-xs text-xs shadow-2xs leading-relaxed border border-gray-100/80">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="mt-2 pt-1 flex-shrink-0">
            <div className="bg-white rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xs border border-gray-100">
              <button
                type="button"
                className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                title="Đính kèm"
              >
                <ImageIcon size={17} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-xl bg-[#1b357d] text-white flex items-center justify-center hover:bg-[#152a65] disabled:opacity-40 transition-all shadow-sm"
              >
                <Send size={13} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Participants List Tab (Real Users Online) ── */
        <div className="flex-1 overflow-y-auto space-y-2.5 py-2 pr-1">
          {realParticipants.length === 0 ? (
            <div className="flex items-center gap-3 p-2.5 bg-white rounded-2xl shadow-2xs border border-gray-100/70">
              <div className="relative">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{userName} (You)</p>
                <p className="text-[10px] text-green-600 font-medium">Đang hoạt động</p>
              </div>
            </div>
          ) : (
            realParticipants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2.5 bg-white rounded-2xl shadow-2xs border border-gray-100/70"
              >
                <div className="relative">
                  <img
                    src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                    alt={p.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      p.isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {p.name} {p.id === user?.id ? '(You)' : ''}
                  </p>
                  <p className="text-[10px] text-green-600 font-medium">
                    {p.isHost ? 'Host • Đang trong phòng' : 'Đang kết nối'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


