import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

interface SystemNotification {
  mathongbao: string;
  manguoigui: string;
  manguoinhan: string;
  loai: string;
  tieude: string;
  noidung: string;
  dadoc: boolean;
  ngaytao: string;
}

interface NotificationPayload {
  action?: string;
  status?: string;
  targetRole?: string;
  parkingLotId?: string;
  parkingLotName?: string;
  parkingLotJoinCode?: string;
  customName?: string;
  canSwitchLots?: boolean;
}

interface ParsedNotification extends SystemNotification {
  payload: NotificationPayload | null;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<ParsedNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const parseNotificationPayload = useCallback((notification: SystemNotification): ParsedNotification => {
    let payload: NotificationPayload | null = null;
    try {
      if (notification.noidung) {
        payload = JSON.parse(notification.noidung);
      }
    } catch (error) {
      console.warn('Failed to parse notification payload:', error);
    }
    return { ...notification, payload };
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('thongbao')
        .select('*')
        .eq('manguoinhan', user.id)
        .order('ngaytao', { ascending: false });

      if (error) throw error;

      const parsedNotifications = (data || []).map(parseNotificationPayload);
      setNotifications(parsedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [parseNotificationPayload]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('thongbao')
        .update({ dadoc: true })
        .eq('mathongbao', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(noti =>
          noti.mathongbao === notificationId ? { ...noti, dadoc: true } : noti
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
  };
};