import { useEffect, useState } from 'react';
import { useMastoClient } from './use-masto-client';
import type { MastoStatus } from '@/types/mastodon';

export function useHomeTimeline() {
  const client = useMastoClient();
  const [statuses, setStatuses] = useState<MastoStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    if (!client) return;
    try {
      const result = await client.v1.timelines.home.list({ limit: 40 });
      setStatuses(result);
      setHasMore(result.length > 0);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load timeline');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTimeline().finally(() => setLoading(false));
  }, [!!client]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  };

  const fetchMore = async () => {
    if (loadingMore || !hasMore || statuses.length === 0 || !client) return;
    setLoadingMore(true);
    try {
      const maxId = statuses[statuses.length - 1].id;
      const result = await client.v1.timelines.home.list({ limit: 40, maxId });
      setStatuses(prev => [...prev, ...result]);
      setHasMore(result.length > 0);
    } catch (e: unknown) {
      console.error('fetchMore error:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  return { statuses, setStatuses, loading, refreshing, loadingMore, hasMore, error, onRefresh, fetchMore };
}
