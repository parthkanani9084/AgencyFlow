import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { reelService, CreateReelPayload } from '../services/reel.service';
import { QUERY_KEYS } from '../queryKeys';
import { Reel } from '@/types';

export const useCreateReel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReelPayload) => reelService.createReel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REELS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
};

export interface GetReelsResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: Reel[];
    counts: {
      schedule: number;
      production: number;
      uploaded: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItem: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const useGetReels = (params?: any, options?: any) => {
  const queryKey = useMemo(() => [QUERY_KEYS.REELS, params], [params]);
  return useQuery<GetReelsResponse>({
    queryKey,
    queryFn: () => reelService.getReels(params),
    ...options,
  });
};

export const useUpdateReelStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      reelService.updateReelStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REELS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
};
