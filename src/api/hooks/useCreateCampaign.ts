import { UpdateCampaignPayload } from './../services/campaign.service';
import { useMutation, useQuery , useQueryClient } from '@tanstack/react-query';
import {
  campaignService,
  CreateCampaignPayload,
  GetCampaignsParams,
} from '../services/campaign.service';

export const useCreateCampaign = () => {
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) =>
      campaignService.createCampaign(payload),
  });
};

export const useGetCampaigns = (params: GetCampaignsParams) => {
  return useQuery({
    queryKey: ['campaigns', params.page, params.limit],
    queryFn: () => campaignService.getCampaigns(params),
  });
};

export const useDeleteCampaign = () => {
  return useMutation({
    mutationFn: (campaignId: string) => campaignService.deleteCampaign(campaignId),
  });
};
export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: UpdateCampaignPayload;
    }) => campaignService.updateCampaign(campaignId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useGetCampaignById = (campaignId?: string) => {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignService.getCampaignById(campaignId as string),
    enabled: !!campaignId,
  });
};