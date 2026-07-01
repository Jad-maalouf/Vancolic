import { api } from '../api/apiClient.js';
import { useFetch } from './useFetch.js';

export function useOpenOrders() {
  const { data, loading, error, refetch } = useFetch(api.getOpenOrders, []);
  return { orders: data?.orders ?? [], loading, error, refetch };
}
