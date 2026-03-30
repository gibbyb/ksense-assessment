import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchPatients } from '../api/patients';
import { apiRetryConfig } from '../lib/queryConfig';

export const usePatients = (page = 1, limit = 10) => useQuery({
  queryKey: ['patients', page, limit],
  queryFn: () => fetchPatients(page, limit),
  placeholderData: keepPreviousData,
  staleTime: 30_000,
  ...apiRetryConfig,
});
