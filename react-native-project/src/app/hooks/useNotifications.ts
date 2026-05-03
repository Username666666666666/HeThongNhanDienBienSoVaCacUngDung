import { useCallback, useState } from 'react';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = Date.now().toString();
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration || 3000,
      };

      setNotifications(prev => [...prev, newNotification]);

      if (newNotification.duration) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) =>
      addNotification({ message, type: 'success', duration }),
    [addNotification]
  );

  const showError = useCallback(
    (message: string, duration?: number) =>
      addNotification({ message, type: 'error', duration }),
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) =>
      addNotification({ message, type: 'info', duration }),
    [addNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) =>
      addNotification({ message, type: 'warning', duration }),
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
