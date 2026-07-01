import { useCallback } from 'react';
import { api } from '../api/apiClient.js';
import { useFetch } from './useFetch.js';

export function useMenuItems({ all = false } = {}) {
  const fetcher = useCallback(() => (all ? api.getAllMenu() : api.getPublicMenu()), [all]);
  const { data, loading, error, refetch } = useFetch(fetcher, [fetcher]);
  return { items: data?.items ?? [], loading, error, refetch };
}
