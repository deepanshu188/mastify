import { LegendList } from "@legendapp/list";
import { createRestAPIClient, mastodon } from 'masto';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FilterIcon from '@/assets/icons/filter.svg';
import PencilIcon from '@/assets/icons/pencil.svg';
import LogoTextIcon from '@/assets/logo.svg';
import { Avatar } from '@/components/atoms/avatar';
import { PostCard } from '@/components/organisms/post-card';
import { useAuth } from '@/context/auth';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

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
      setHasMore(result.length === 40);
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
      setHasMore(result.length === 40);
    } catch(e: any) {
      console.error('error: ', e)
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}>
        <LogoTextIcon color={theme.logoColor} />
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <FilterIcon />
          </TouchableOpacity>
          {auth.avatar ? <Avatar uri={auth.avatar} style={styles.headerAvatar} /> : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.icon }]}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryBtn}>
            <Text style={{ color: theme.tint }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <LegendList
          data={statuses}
          renderItem={({ item }) => <PostCard status={item} />}
          keyExtractor={(item) => item.id}
          recycleItems
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color={theme.tint} style={styles.footerSpinner} /> : null
          }
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: theme.tintColorDefault, bottom: 66 }]}
        android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 28 }}>
        <PencilIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { paddingVertical: 8, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: { padding: 4 },
  headerAvatar: { width: 32, height: 32 },
  card: { borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, marginTop: 2 },
  footerSpinner: { paddingVertical: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
