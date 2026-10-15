import { useQuery } from '@tanstack/react-query';
import { fetchTickets } from '../api/ticketsApi.js';

export function useTicketsQuery(failureMode) {
  return useQuery({
    queryKey: ['tickets', failureMode],
    queryFn: ({ signal }) => fetchTickets({ failureMode, signal }),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
