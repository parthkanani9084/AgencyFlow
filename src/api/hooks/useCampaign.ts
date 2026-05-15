import { UpdateCampaignPayload } from './../services/campaign.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    },
  });
};

export const useGetCampaigns = (params: GetCampaignsParams) => {
  const queryKey = useMemo(() => [QUERY_KEYS.CAMPAIGNS, params], [params]);
  return useQuery({
    queryKey,
    queryFn: () => campaignService.getCampaigns(params),
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => campaignService.deleteCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CAMPAIGNS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    },
  });
};

export const useGetCampaignById = (campaignId?: string) => {
  const queryKey = useMemo(() => [QUERY_KEYS.CAMPAIGNS, campaignId], [campaignId]);
  return useQuery({
    queryKey,
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    },
  });
};

export const useGetPerformanceHistory = (campaignId?: string) => {
  const queryKey = useMemo(() => [QUERY_KEYS.CAMPAIGN_PERFORMANCE_HISTORY, campaignId], [campaignId]);
  return useQuery({
    queryKey,
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
};

export const useGetCampaignActivity = (campaignId?: string) => {
  const queryKey = useMemo(() => [QUERY_KEYS.CAMPAIGN_ACTIVITY, campaignId], [campaignId]);
  return useQuery({
    queryKey,
    queryFn: () => campaignService.getCampaignActivity(campaignId as string),
    enabled: !!campaignId,
  });
};