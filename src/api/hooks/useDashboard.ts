import { useQuery } from '@tanstack/react-query';
import { dashboardService, GetDashboardResponse } from '../services/dashboard.service';
import { QUERY_KEYS } from '../queryKeys';

export const useGetDashboard = () => {
  return useQuery<GetDashboardResponse>({
    queryKey: [QUERY_KEYS.DASHBOARD],
    queryFn: () => dashboardService.getDashboard(),
  });
};
