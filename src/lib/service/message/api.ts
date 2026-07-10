import apiClient, { USE_MOCK, delay } from '@/lib/api-client';
import { Message } from '../auth/type';
import { mockMessages, mockUsers } from '../mock-data';

export const messageService = {
  getContacts: async (): Promise<any[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockUsers.map(u => ({
        id: u.userId,
        name: u.fullName,
        lastMessage: 'Click to view chat...',
        lastTime: '',
        unread: 0,
        isOnline: true
      }));
    } else {
      const res = await apiClient.get<any>('/student/messages/contacts');
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải danh sách liên hệ');
      }
      return res.data.result || [];
    }
  },

  getConversation: async (partnerId: string): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockMessages.filter(
        (m) =>
          (m.senderId === partnerId) || (m.receiverId === partnerId)
      );
    } else {
      const res = await apiClient.get<any>(`/student/messages/conversation/${partnerId}`);
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi tải tin nhắn');
      }
      return (res.data.result || []).map((m: any) => ({
        messageId: m.messageId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        createdAt: m.sentAt || new Date().toISOString(),
        isRead: m.isRead,
        senderName: m.senderName,
        receiverName: m.receiverName
      }));
    }
  },

  sendMessage: async (receiverId: string, content: string): Promise<Message> => {
    if (USE_MOCK) {
      await delay(200);
      const newMessage: Message = {
        messageId: `msg-${Math.random().toString(36).substring(2, 9)}`,
        senderId: 'current-user-id',
        receiverId,
        content,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      mockMessages.push(newMessage);
      return newMessage;
    } else {
      const res = await apiClient.post<any>('/student/messages/send', {
        receiverId,
        content
      });
      if (!res.data.isSuccess) {
        throw new Error(res.data.errorMessage || 'Lỗi khi gửi tin nhắn');
      }
      const m = res.data.result;
      return {
        messageId: m.messageId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        createdAt: m.sentAt || new Date().toISOString(),
        isRead: m.isRead,
        senderName: m.senderName
      };
    }
  }
};
