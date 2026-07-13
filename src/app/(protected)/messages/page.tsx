'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message, messageService } from '@/lib/service';
import { Send, User, MessageSquare } from 'lucide-react';

export default function UnifiedMessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Tải danh sách liên hệ (contacts) từ API
  useEffect(() => {
    if (!user) return;
    const loadContacts = async () => {
      try {
        const data = await messageService.getContacts();
        setContacts(data);
        // Tự động chọn contact đầu tiên nếu chưa chọn ai
        if (data.length > 0 && !selectedContact) {
          setSelectedContact(data[0]);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách liên hệ:', err);
      }
    };

    loadContacts();
    const interval = setInterval(loadContacts, 5000);
    return () => clearInterval(interval);
  }, [user, selectedContact]);

  // Tải tin nhắn của cuộc trò chuyện hiện tại
  useEffect(() => {
    if (!selectedContact) return;
    const loadMessages = async () => {
      try {
        const data = await messageService.getConversation(selectedContact.id);
        setMessages(data);
      } catch (err) {
        console.error('Lỗi khi tải tin nhắn:', err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedContact]);

  // Scroll to bottom of chat container only
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !inputText.trim()) return;

    try {
      const sentMsg = await messageService.sendMessage(selectedContact.id, inputText.trim());
      setMessages((prev) => [...prev, sentMsg]);
      setInputText('');
    } catch (err: any) {
      console.error('Lỗi gửi tin nhắn:', err);
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
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-550 bg-blue-50 text-blue-900 border-l-4 border-blue-600'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{c.name}</span>
                      {c.lastTime && <span className="text-[10px] text-zinc-400">{c.lastTime}</span>}
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
              <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-950">{selectedContact.name}</h2>
                <span className="text-[10px] text-zinc-500 font-medium">Trò chuyện trực tiếp</span>
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
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Send className="h-4.5 w-4.5" />
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
