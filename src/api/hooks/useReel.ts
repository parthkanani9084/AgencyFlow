import { useMutation, useQuery } from '@tanstack/react-query';
import { reelService, CreateReelPayload } from '../services/reel.service';
import { QUERY_KEYS } from '../queryKeys';

export const useCreateReel = () => {
  return useMutation({
    mutationFn: (payload: CreateReelPayload) => reelService.createReel(payload),
  });
};

export interface GetReelsResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: any[];
    counts: {
      schedule: number;
      production: number;
      uploaded: number;
    };
    pagination: any;
  };
}

export const useGetReels = (params?: any, options?: any) => {
  return useQuery<GetReelsResponse>({
    queryKey: [QUERY_KEYS.REELS, params],
    queryFn: () => reelService.getReels(params),
    ...options,
  });
};

export const useUpdateReelStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      reelService.updateReelStatus(id, status),
  });
};
