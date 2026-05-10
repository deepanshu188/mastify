import { createRestAPIClient, mastodon } from 'masto';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';

export function useHomeTimeline() {
  const { auth } = useAuth();
  const [statuses, setStatuses] = useState<mastodon.v1.Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getClient = () => {
    if (!auth.token || !auth.instance) return null;
    return createRestAPIClient({
      url: `https://${auth.instance}`,
      accessToken: auth.token,
    });
  };

  const fetchTimeline = async () => {
    const client = getClient();
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
  }, [auth.token, auth.instance]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  };

  const fetchMore = async () => {
    if (loadingMore || !hasMore || statuses.length === 0) return;
    const client = getClient();
    if (!client) return;
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

  return { statuses, loading, refreshing, loadingMore, hasMore, error, onRefresh, fetchMore };
}
