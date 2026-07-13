'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSignalR, RealtimeMessage } from '@/context/SignalRContext';
import { Message, messageService } from '@/lib/service';
import { Send, User, MessageSquare, Wifi, WifiOff } from 'lucide-react';

export default function UnifiedMessagesPage() {
  const { user } = useAuth();
  const { chatConnected, sendMessage: signalRSend, onReceiveMessage, onMessageSent, markRead, onlineUsers } =
    useSignalR();

  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedContactRef = useRef<any>(null);

  // Keep ref in sync so we can access it inside event handlers
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // ── Load contacts (REST, chỉ 1 lần) ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    messageService
      .getContacts()
      .then((data) => {
        setContacts(data);
        if (data.length > 0 && !selectedContactRef.current) {
          setSelectedContact(data[0]);
        }
      })
      .catch(console.error);
  }, [user]);

  // ── Load lịch sử tin nhắn khi chọn contact ───────────────────────────────
  useEffect(() => {
    if (!selectedContact) return;
    messageService
      .getConversation(selectedContact.id)
      .then((data) => {
        setMessages(data);
        // Mark messages as read via SignalR
        if (chatConnected) {
          markRead(selectedContact.id).catch(console.error);
        }
      })
      .catch(console.error);
  }, [selectedContact, chatConnected, markRead]);

  // ── SignalR: nhận tin nhắn realtime ──────────────────────────────────────
  useEffect(() => {
    const unsub = onReceiveMessage((msg: RealtimeMessage) => {
      const currentContact = selectedContactRef.current;
      // Chỉ thêm vào conversation hiện tại nếu đúng partner
      if (
        currentContact &&
        (msg.senderId === currentContact.id || msg.receiverId === currentContact.id)
      ) {
        const mapped: Message = {
          messageId: msg.messageId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          createdAt: msg.sentAt,
          isRead: msg.isRead,
          senderName: msg.senderName,
        };
        setMessages((prev) => {
          // Tránh duplicate
          if (prev.some((m) => m.messageId === msg.messageId)) return prev;
          return [...prev, mapped];
        });
      }

      // Cập nhật lastMessage trong contacts list
      setContacts((prev) =>
        prev.map((c) =>
          c.id === msg.senderId || c.id === msg.receiverId
            ? { ...c, lastMessage: msg.content, lastTime: formatTime(msg.sentAt) }
            : c
        )
      );
    });

    return unsub;
  }, [onReceiveMessage]);

  // ── SignalR: confirm tin nhắn đã gửi ─────────────────────────────────────
  useEffect(() => {
    const unsub = onMessageSent((msg: RealtimeMessage) => {
      const mapped: Message = {
        messageId: msg.messageId,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        createdAt: msg.sentAt,
        isRead: msg.isRead,
        senderName: msg.senderName,
      };
      setMessages((prev) => {
        if (prev.some((m) => m.messageId === msg.messageId)) return prev;
        return [...prev, mapped];
      });

      setContacts((prev) =>
        prev.map((c) =>
          c.id === msg.receiverId
            ? { ...c, lastMessage: msg.content, lastTime: formatTime(msg.sentAt) }
            : c
        )
      );
    });

    return unsub;
  }, [onMessageSent]);

  // ── Auto-scroll (chỉ khi đang ở bottom) ──────────────────────────────────
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const threshold = 100;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    try {
      if (chatConnected) {
        // Dùng SignalR realtime
        await signalRSend(selectedContact.id, content);
      } else {
        // Fallback: REST API
        const sentMsg = await messageService.sendMessage(selectedContact.id, content);
        setMessages((prev) => [...prev, sentMsg]);
      }
    } catch (err: any) {
      console.error('Lỗi gửi tin nhắn:', err);
    }
  };

  // ── Handle Enter key ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      {/* Sidebar - Danh sách liên hệ */}
      <div className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Hội thoại
            {/* Connection indicator */}
            <span className="ml-auto">
              {chatConnected ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <Wifi className="h-3 w-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                  <WifiOff className="h-3 w-3" /> Offline
                </span>
              )}
            </span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              Không có người liên hệ nào.
            </div>
          ) : (
            contacts.map((c) => {
              const isSelected = selectedContact?.id === c.id;
              const isOnline = onlineUsers.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <div className="relative h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                    <User className="h-5 w-5" />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{c.name}</span>
                      {c.lastTime && (
                        <span className="text-[10px] text-zinc-400">{c.lastTime}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{c.lastMessage}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Vùng chat chính */}
      <div className="flex-1 flex flex-col bg-zinc-50/10">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-4 bg-zinc-50">
              <div className="relative h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
                <User className="h-5 w-5" />
                {onlineUsers.has(selectedContact.id) && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-950">{selectedContact.name}</h2>
                <span className="text-[10px] font-medium">
                  {onlineUsers.has(selectedContact.id) ? (
                    <span className="text-emerald-600">● Đang hoạt động</span>
                  ) : (
                    <span className="text-zinc-400">Ngoại tuyến</span>
                  )}
                </span>
              </div>
            </div>

            {/* Khung tin nhắn */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-zinc-400 text-sm">
                  Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.userId;
                  return (
                    <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-start gap-2.5 max-w-[70%]">
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <span className={`block text-[9px] text-zinc-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ô nhập tin nhắn */}
            <form onSubmit={handleSend} className="border-t border-zinc-200 px-6 py-4 flex items-center gap-3 bg-white">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chatConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'}
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
            <MessageSquare className="h-12 w-12 text-zinc-300 mb-2" />
            <p className="text-sm">Chọn một cuộc hội thoại từ danh sách để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
}
