import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { QUERY_KEYS } from '../queryKeys';

export const useGetNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: () => notificationService.getNotifications(),
  });
};

export const useMarkAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });
};

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.readNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });
};

export const useGetUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.UNREAD_NOTIFICATIONS_COUNT],
    queryFn: () => notificationService.getUnreadNotificationsCount(),
  });
};

