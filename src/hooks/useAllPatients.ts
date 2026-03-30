import { useQuery } from '@tanstack/react-query'
import { fetchAllPatients } from '../api/patients'
import { apiRetryConfig } from '../lib/queryConfig'

export const useAllPatients = () => useQuery({
  queryKey: ['patients', 'all'],
  queryFn: fetchAllPatients,
  staleTime: 5 * 60_000,
  gcTime: 10 * 60_000,
  ...apiRetryConfig,
});
