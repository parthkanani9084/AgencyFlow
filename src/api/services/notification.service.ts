import AxiosRequest from '@/utils/axiosHelper';
import { GET_NOTIFICATIONS_URL, GET_UNREAD_NOTIFICATIONS_COUNT_URL, MARK_ALL_READ_NOTIFICATIONS_URL, READ_NOTIFICATION_URL } from '@/api/endpoints';
import { Notification } from '@/types';

export interface MarkAllReadNotificationsResponse {
  success: boolean;
  code: number;
  message: string;
}

export interface ReadNotificationResponse {
  success: boolean;
  code: number;
  message: string;
}

export interface GetUnreadNotificationsCountResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    unread_count: number;
  };
}

export interface GetNotificationsResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: Notification[];
    unread_count: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItem: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const notificationService = {
  getNotifications: async (): Promise<GetNotificationsResponse> => {
    const response = await AxiosRequest.get(GET_NOTIFICATIONS_URL);
    return response;
  },
  markAllRead: async (): Promise<MarkAllReadNotificationsResponse> => {
    const response = await AxiosRequest.patch(MARK_ALL_READ_NOTIFICATIONS_URL);
    return response;
  },
  readNotification: async (id: string): Promise<ReadNotificationResponse> => {
    const response = await AxiosRequest.patch(READ_NOTIFICATION_URL(id));
    return response;
  },
  getUnreadNotificationsCount: async (): Promise<GetUnreadNotificationsCountResponse> => {
    const response = await AxiosRequest.get(GET_UNREAD_NOTIFICATIONS_COUNT_URL);
    return response;
  },
};
