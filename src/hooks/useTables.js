import { api } from '../api/apiClient.js';
import { useFetch } from './useFetch.js';

export function useTables() {
  const { data, loading, error, refetch } = useFetch(api.getTables, []);
  return { tables: data?.tables ?? [], loading, error, refetch };
}
