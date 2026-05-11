import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService, CreateTeamPayload, UpdateTeamPayload, GetTeamsParams, GetTeamsResponse } from '../services/team.service';
import { QUERY_KEYS } from '../queryKeys';

export const useGetTeams = (params: GetTeamsParams, options?: any) => {
  return useQuery<GetTeamsResponse>({
    queryKey: [QUERY_KEYS.TEAMS, params.page, params.limit, params.search],
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
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeamMember(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
    },
  });
};

export const useTeamRole = (id: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TEAM_ROLE, id],
    queryFn: () => teamService.getTeamRole(id!),
    enabled: !!id,
  });
};
