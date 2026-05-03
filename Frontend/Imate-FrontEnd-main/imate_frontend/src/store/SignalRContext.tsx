import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
// 1. Import các hook/client cần thiết
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import apiClient from '@/services/apiClient'; // (API client của bạn)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export type NotificationPayload = {
  id: number;
  message: string;
  isRead: boolean;
  createdAt?: string;
  link?: string;
  type?: string;
  [key: string]: unknown;
};

// Định nghĩa "hình dạng" của Context
interface SignalRContextState {
  connection: signalR.HubConnection | null;
  notifications: NotificationPayload[];
  unreadCount: number;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

// Tạo Context
const SignalRContext = createContext<SignalRContextState>({
  connection: null,
  notifications: [],
  unreadCount: 0,
  markNotificationAsRead: async () => { },
  markAllNotificationsAsRead: async () => { },
});

// Custom hook để component khác dễ dàng sử dụng
export const useSignalR = () => useContext(SignalRContext);

// Props của Provider
interface SignalRProviderProps {
  children: ReactNode;
}

// Provider Component
export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  const { isAuthenticated } = useAuth();
  const hubUrl = `${API_BASE_URL}/systemNotificationHub`;
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const extractNotificationList = (payload: unknown): NotificationPayload[] => {
    if (Array.isArray(payload)) {
      return payload as NotificationPayload[];
    }

    if (payload && typeof payload === 'object') {
      const objectPayload = payload as Record<string, unknown>;
      const nested = objectPayload.data ?? objectPayload.items ?? objectPayload.Data ?? objectPayload.Items;
      if (Array.isArray(nested)) {
        return nested as NotificationPayload[];
      }
    }

    return [];
  };

  const markNotificationAsRead = async (notificationId: number) => {
    const target = notifications.find((notification) => notification.id === notificationId);
    if (!target || target.isRead) {
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );

    try {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('MarkNotificationAsRead', notificationId.toString());
      } else {
        console.warn("SignalR: Cannot mark notification as read. Hub is not connected.");
      }
    } catch (error) {
      console.error('SignalR: Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (notifications.every((notification) => notification.isRead)) {
      return;
    }

    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));

    try {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('MarkAllNotificationsAsRead');
      } else {
        console.warn("SignalR: Cannot mark all as read. Hub is not connected.");
      }
    } catch (error) {
      console.error('SignalR: Failed to mark all notifications as read:', error);
    }
  };

  // ----- EFFECT 1: Tải các thông báo CŨ -----
  // Chạy khi người dùng vừa đăng nhập (isAuthenticated chuyển thành true)
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      if (isAuthenticated) {
        try {
          // 1. Gọi API để lấy thông báo cũ (hãy thay bằng endpoint của bạn)
          const response = await apiClient.get<NotificationPayload[] | { data?: NotificationPayload[]; items?: NotificationPayload[] }>('/notifications/my-notifications');
          // 2. Set vào state
          setNotifications(extractNotificationList(response.data));
          console.log('SignalR: Fetched initial notifications.');
        } catch (error) {
          console.error("SignalR: Failed to fetch initial notifications:", error);
        }
      }
    };

    fetchInitialNotifications();
  }, [isAuthenticated]); // Chạy lại khi trạng thái đăng nhập thay đổi

  // ----- EFFECT 2: Xử lý kết nối real-time (SignalR) -----
  // Cũng chạy khi người dùng vừa đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      // 1. Lấy token từ localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log('SignalR: User authenticated but no token found.');
        return; // Dừng nếu không có token
      }

      // 2. Xây dựng kết nối
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => token }) // Gửi token
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);

      // 3. Bắt đầu kết nối
      newConnection.start()
        .then(() => {
          console.log('SignalR Connected (Authenticated).');

          // 4. Lắng nghe sự kiện "ReceiveNotification" từ backend
          newConnection.on('ReceiveNotification', (payload: NotificationPayload) => {
            console.log('SignalR: New notification received:', payload);

            // 4a. Thêm thông báo MỚI vào ĐẦU danh sách
            setNotifications((prevNotifications) => [payload, ...prevNotifications]);

            // 4b. HIỂN THỊ TOAST (TÍCH HỢP)
            // Show toast notification - use default styling like other toasts
            if (payload.link && payload.type === 'AI_INTERVIEW_RESULT_READY') {
              // Show simple success toast with message only (no custom button/styling)
              // Use style to ensure normal font weight (not bold)
              toast.success(payload.message || 'Kết quả phỏng vấn đã sẵn sàng!', {
                style: { fontWeight: 'normal' },
                className: 'toast-normal-weight'
              });
            } else {
              // Regular notification toast
              toast.info(payload.message || 'Bạn có thông báo mới!');
            }
          });
        })
        .catch((err) => console.error('SignalR Connection Error: ', err));

      // 5. Cleanup: Ngắt kết nối khi logout (isAuthenticated = false)
      return () => {
        console.log('Stopping SignalR connection...');
        newConnection.stop();
      };
    }
  }, [isAuthenticated]); // Chạy lại khi trạng thái đăng nhập thay đổi

  // Cung cấp state và kết nối cho các component con
  return (
    <SignalRContext.Provider
      value={{
        connection,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};