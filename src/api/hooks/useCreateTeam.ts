import { useMutation } from '@tanstack/react-query';
import { teamService, CreateTeamPayload } from '../services/team.service';

export const useCreateTeam = () => {
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamService.createTeam(payload),
  });
};
