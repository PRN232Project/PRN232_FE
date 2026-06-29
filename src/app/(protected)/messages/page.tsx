'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message, mockMessages, mockUsers } from '@/lib/service';
import { Send } from 'lucide-react';

export default function UnifiedMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Determine chat partner based on current user's role
  const isStudent = user?.role === 2;
  const receiverId = isStudent ? 'teacher-id-2222' : 'student-id-3333';
  const chatPartner = mockUsers.find((u) => u.userId === receiverId);

  useEffect(() => {
    if (!user) return;
    const loadMessages = () => {
      const filtered = mockMessages.filter(
        (m) =>
          (m.senderId === user.userId && m.receiverId === receiverId) ||
          (m.senderId === receiverId && m.receiverId === user.userId)
      );
      setMessages(filtered);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [user, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputText.trim()) return;

    const newMessage: Message = {
      messageId: `msg-${Math.random().toString(36).substring(2, 9)}`,
      senderId: user.userId,
      receiverId: receiverId,
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
      senderName: user.fullName,
      receiverName: chatPartner?.fullName || 'Người nhận',
    };

    mockMessages.push(newMessage);
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      {/* Active Chat Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-4 bg-zinc-50">
        <img
          src={chatPartner?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop'}
          alt={chatPartner?.fullName}
          className="h-10 w-10 rounded-full object-cover border border-zinc-300"
        />
        <div>
          <h2 className="text-sm font-bold text-zinc-950">{chatPartner?.fullName || 'Người nhận'}</h2>
          <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Trực tuyến
          </span>
        </div>
      </div>

      {/* Messages Bubbles Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 text-sm">
            Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.userId;
            return (
              <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2.5 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <img
                      src={chatPartner?.image}
                      alt="avatar"
                      className="h-7 w-7 rounded-full object-cover border border-zinc-200 mt-1"
                    />
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? user?.role === 1 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-blue-600 text-white rounded-tr-none'
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="border-t border-zinc-200 px-6 py-4 flex items-center gap-3 bg-white">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-xl border border-zinc-355/80 border-zinc-300 px-4 py-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
        <button
          type="submit"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow transition-all cursor-pointer ${
            user?.role === 1 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
