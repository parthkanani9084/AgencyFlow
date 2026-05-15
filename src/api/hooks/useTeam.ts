import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { teamService, CreateTeamPayload, UpdateTeamPayload, GetTeamsParams, GetTeamsResponse } from '../services/team.service';
import { QUERY_KEYS } from '../queryKeys';

export const useGetTeams = (params: GetTeamsParams, options?: any) => {
  const queryKey = useMemo(() => [QUERY_KEYS.TEAMS, params], [params]);
  return useQuery<GetTeamsResponse>({
    queryKey,
    queryFn: () => teamService.getTeams(params),
    ...options,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamPayload }) =>
      teamService.updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeamMember(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
    },
  });
};

export const useTeamRole = (id: string | null) => {
  const queryKey = useMemo(() => [QUERY_KEYS.TEAM_ROLE, id], [id]);
  return useQuery({
    queryKey,
    queryFn: () => teamService.getTeamRole(id!),
    enabled: !!id,
  });
};

export const useGetTeamsByRole = (role: string, options?: any) => {
  const queryKey = useMemo(() => [QUERY_KEYS.TEAMS, 'role', role], [role]);
  return useQuery({
    queryKey,
    queryFn: () => teamService.getTeamsByRole(role),
    ...options,
  });
};
