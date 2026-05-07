import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientService, CreateClientPayload, UpdateClientPayload, GetClientsParams } from '../services/client.service';

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientService.createClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useClients = (params: GetClientsParams) => {
  return useQuery({
    queryKey: ['clients', params.page, params.limit, params.search],
    queryFn: () => clientService.getClients(params),
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, payload }: { clientId: string; payload: UpdateClientPayload }) =>
      clientService.updateClient(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => clientService.deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
