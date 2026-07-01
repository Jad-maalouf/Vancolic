import { api } from '../api/apiClient.js';
import { useFetch } from './useFetch.js';

export function useUsers() {
  const { data, loading, error, refetch } = useFetch(api.getUsers, []);
  return { users: data?.users ?? [], loading, error, refetch };
}
