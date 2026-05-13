import { UpdateCampaignPayload } from './../services/campaign.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  campaignService,
  CreateCampaignPayload,
  GetCampaignsParams,
  LogPerformancePayload,
} from '../services/campaign.service';
import { QUERY_KEYS } from '../queryKeys';

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) =>
      campaignService.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CAMPAIGNS] });
    },
  });
};

export const useGetCampaigns = (params: GetCampaignsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CAMPAIGNS, params],
    queryFn: () => campaignService.getCampaigns(params),
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => campaignService.deleteCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CAMPAIGNS] });
    },
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CAMPAIGNS] });
    },
  });
};

export const useGetCampaignById = (campaignId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CAMPAIGNS, campaignId],
    queryFn: () => campaignService.getCampaignById(campaignId as string),
    enabled: !!campaignId,
  });
};

export const useLogPerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: LogPerformancePayload;
    }) => campaignService.logPerformance(campaignId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CAMPAIGNS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CAMPAIGN_PERFORMANCE_HISTORY, variables.campaignId],
      });
    },
  });
};

export const useGetPerformanceHistory = (campaignId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CAMPAIGN_PERFORMANCE_HISTORY, campaignId],
    queryFn: () => campaignService.getPerformanceHistory(campaignId as string),
    enabled: !!campaignId,
  });
};

export const useDeletePerformanceHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (historyId: string) => campaignService.deletePerformanceHistory(historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CAMPAIGNS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CAMPAIGN_PERFORMANCE_HISTORY] });
    },
  });
};

export const useGetCampaignActivity = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CAMPAIGN_ACTIVITY],
    queryFn: () => campaignService.getCampaignActivity(),
  });
};