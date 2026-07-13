'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';

const HUB_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5180';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RealtimeMessage {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  senderName: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt: string;
  read: boolean;
}

interface SignalRContextType {
  // Connection state
  chatConnected: boolean;
  notifConnected: boolean;
  onlineUsers: Set<string>;

  // Chat
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  onReceiveMessage: (handler: (msg: RealtimeMessage) => void) => () => void;
  onMessageSent: (handler: (msg: RealtimeMessage) => void) => () => void;
  markRead: (senderId: string) => Promise<void>;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const SignalRContext = createContext<SignalRContextType | null>(null);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const chatHubRef = useRef<signalR.HubConnection | null>(null);
  const notifHubRef = useRef<signalR.HubConnection | null>(null);

  const [chatConnected, setChatConnected] = useState(false);
  const [notifConnected, setNotifConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Handlers stored as refs to avoid stale closures
  const messageHandlers = useRef<Set<(msg: RealtimeMessage) => void>>(new Set());
  const messageSentHandlers = useRef<Set<(msg: RealtimeMessage) => void>>(new Set());

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  // ── Chat Hub Setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}/hubs/chat`, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    chatHubRef.current = connection;

    connection.on('ReceiveMessage', (msg: RealtimeMessage) => {
      messageHandlers.current.forEach((h) => h(msg));
    });

    connection.on('MessageSent', (msg: RealtimeMessage) => {
      messageSentHandlers.current.forEach((h) => h(msg));
    });

    connection.on('UserOnline', (userId: string) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    connection.on('UserOffline', (userId: string) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    connection.onreconnected(() => setChatConnected(true));
    connection.onclose(() => setChatConnected(false));

    let isMounted = true;
    const startPromise = connection
      .start()
      .then(() => {
        if (!isMounted) return;
        setChatConnected(true);
        // Load online users list
        connection.invoke<string[]>('GetOnlineUsers').then((users) => {
          if (isMounted) {
            setOnlineUsers(new Set(users));
          }
        });
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[ChatHub] Connection error:', err);
        }
      });

    return () => {
      isMounted = false;
      startPromise.finally(() => {
        connection.stop().catch(() => {});
      });
      chatHubRef.current = null;
      setChatConnected(false);
    };
  }, [user, getToken]);

  // ── Notification Hub Setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}/hubs/notification`, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    notifHubRef.current = connection;

    connection.on('ReceiveNotification', (notif: Omit<Notification, 'read'>) => {
      setNotifications((prev) => [{ ...notif, read: false }, ...prev].slice(0, 100));
    });

    connection.onreconnected(() => setNotifConnected(true));
    connection.onclose(() => setNotifConnected(false));

    let isMounted = true;
    const startPromise = connection
      .start()
      .then(() => {
        if (isMounted) {
          setNotifConnected(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[NotifHub] Connection error:', err);
        }
      });

    return () => {
      isMounted = false;
      startPromise.finally(() => {
        connection.stop().catch(() => {});
      });
      notifHubRef.current = null;
      setNotifConnected(false);
    };
  }, [user, getToken]);

  // ── API methods ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!chatHubRef.current || chatHubRef.current.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Chat hub not connected');
    }
    await chatHubRef.current.invoke('SendMessage', receiverId, content);
  }, []);

  const markRead = useCallback(async (senderId: string) => {
    if (!chatHubRef.current || chatHubRef.current.state !== signalR.HubConnectionState.Connected) return;
    await chatHubRef.current.invoke('MarkRead', senderId);
  }, []);

  const onReceiveMessage = useCallback((handler: (msg: RealtimeMessage) => void) => {
    messageHandlers.current.add(handler);
    return () => messageHandlers.current.delete(handler);
  }, []);

  const onMessageSent = useCallback((handler: (msg: RealtimeMessage) => void) => {
    messageSentHandlers.current.add(handler);
    return () => messageSentHandlers.current.delete(handler);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SignalRContext.Provider
      value={{
        chatConnected,
        notifConnected,
        onlineUsers,
        sendMessage,
        onReceiveMessage,
        onMessageSent,
        markRead,
        notifications,
        unreadCount,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error('useSignalR must be used within SignalRProvider');
  return ctx;
}
