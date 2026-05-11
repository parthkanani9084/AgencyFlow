import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  teamService,
  CreateTeamPayload,
  UpdateTeamPayload,
  GetTeamsParams,
} from '../services/team.service';

export const useGetTeams = (params: GetTeamsParams) => {
  return useQuery({
    queryKey: ['teams', params.page, params.limit, params.search],
    queryFn: () => teamService.getTeams(params),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamPayload }) =>
      teamService.updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeamMember(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useTeamRole = (id: string | null) => {
  return useQuery({
    queryKey: ['team-role', id],
    queryFn: () => teamService.getTeamRole(id!),
    enabled: !!id,
  });
};

export const useGetTeamsByRole = (role: string, open: boolean) => {
  return useQuery({
    queryKey: ['teams-by-role', role],
    queryFn: () => teamService.getTeamsByRole(role),
    enabled: !!role && open,
  });
};
