import api from './axios';
import { authService } from './authService';

export interface Notification {
  id: number;
  type: 'JOIN_REQUEST' | 'JOIN_APPROVED' | 'JOIN_REJECTED' | 'TEACHER_INVITE' | 'TEACHER_INVITE_APPROVED' | 'TEACHER_INVITE_REJECTED' | 'LEAVE_CLASS' | 'REMOVED_FROM_CLASS';
  message: string;
  isRead: boolean;
  createdAt: string;
  data: {
    classId?: number;
    className?: string;
    requestId?: number;
    userId?: number;
    userName?: string;
  };
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async markAsRead(notificationId: number): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}; 