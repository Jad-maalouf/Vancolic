import { useCallback } from 'react';
import { api } from '../api/apiClient.js';
import { useFetch } from './useFetch.js';

// Bartender board: every pending/preparing item across all tables.
export function useActiveOrderItems() {
  const { data, loading, error, refetch } = useFetch(api.getActiveOrderItems, []);
  return { items: data?.items ?? [], loading, error, refetch };
}

// A single order's line items (waiter view of one table's tab).
export function useOrderItems(orderId) {
  const fetcher = useCallback(() => {
    if (!orderId) return Promise.resolve({ items: [] });
    return api.getOrderItems(orderId);
  }, [orderId]);
  const { data, loading, error, refetch } = useFetch(fetcher, [fetcher]);
  return { items: data?.items ?? [], loading, error, refetch };
}
