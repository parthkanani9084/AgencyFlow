import AxiosRequest from '@/utils/axiosHelper';
import { GET_DASHBOARD_URL } from '../endpoints';

export interface DashboardMetrics {
  client_summary: {
    total_client_count: number;
  };
  meta_ads_summary: {
    today: {
      ads_spend: number;
      leads: number;
      average_roas: number;
      active_campaign: number;
    };
    last_month: {
      ads_spend: number;
      leads: number;
      average_roas: number;
      active_campaign: number;
    };
  };
  reels_summary: {
    today_schedule_count: number;
    pending_status_count: number;
    processing_status_count: number;
  };
  to_do: {
    not_completed_task_count: number;
    overdue_task_count: number;
  };
}

export interface GetDashboardResponse {
  success: boolean;
  code: number;
  message: string;
  results: DashboardMetrics;
}

export const dashboardService = {
  getDashboard: async (): Promise<GetDashboardResponse> => {
    const response = await AxiosRequest.get(GET_DASHBOARD_URL);
    return response;
  },
};
