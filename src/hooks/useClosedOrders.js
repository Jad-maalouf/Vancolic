import { api } from '../api/apiClient.js';
import { useFetch } from './useFetch.js';

export function useClosedOrders(startDate, endDate) {
  const { data, loading, error, refetch } = useFetch(
    () => api.getClosedOrders(startDate, endDate),
    [startDate, endDate]
  );
  return { orders: data?.orders ?? [], loading, error, refetch };
}
