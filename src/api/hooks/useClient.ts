import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientService, CreateClientPayload, UpdateClientPayload, GetClientsParams, GetClientsResponse } from '../services/client.service';
import { QUERY_KEYS } from '../queryKeys';

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientService.createClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
    },
  });
};

export const useClients = (params: GetClientsParams, options?: any) => {
  return useQuery<GetClientsResponse>({
    queryKey: [QUERY_KEYS.CLIENTS, params],
    queryFn: () => clientService.getClients(params),
    ...options,
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, payload }: { clientId: string; payload: UpdateClientPayload }) =>
      clientService.updateClient(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => clientService.deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
    },
  });
};
