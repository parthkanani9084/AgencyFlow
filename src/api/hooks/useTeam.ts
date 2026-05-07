import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/team.service';

export const useTeams = () => {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => teamService.getTeams(),
  });
};

export const useTeamRole = (id: string | null) => {
  return useQuery({
    queryKey: ['team-role', id],
    queryFn: () => teamService.getTeamRole(id!),
    enabled: !!id,
  });
};
