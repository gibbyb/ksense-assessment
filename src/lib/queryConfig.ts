import { ApiError } from '../api/patients'

export const apiRetryConfig = {
  retry: (failureCount: number, error: Error) => {
    if (error instanceof ApiError && error.status === 429) return failureCount < 5
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
    return failureCount < 3
  },
  retryDelay: (attemptIndex: number, error: Error) => {
    if (error instanceof ApiError && error.status === 429) {
      return Math.min(2000 * 2 ** attemptIndex, 30_000)
    }
    return Math.min(1000 * 2 ** attemptIndex, 10_000)
  },
};
