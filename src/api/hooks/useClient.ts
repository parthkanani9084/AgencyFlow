import { useMutation, useQuery } from '@tanstack/react-query';
import { clientService, CreateClientPayload, GetClientsParams } from '../services/client.service';

export const useCreateClient = () => {
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientService.createClient(payload),
  });
};

export const useClients = (params: GetClientsParams) => {
  return useQuery({
    queryKey: ['clients', params.page, params.limit],
    queryFn: () => clientService.getClients(params),
  });
};
