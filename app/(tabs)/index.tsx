import { Ionicons } from '@expo/vector-icons';
import { LegendList } from "@legendapp/list";
import { createRestAPIClient, mastodon } from 'masto';
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { PostCard } from '@/components/ui/post-card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#e5e5e5';
  const secondary = colorScheme === 'dark' ? '#9BA1A6' : '#6b7280';

  const { auth } = useAuth();
  const [statuses, setStatuses] = useState<mastodon.v1.Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    if (!auth.token || !auth.instance) return;
    try {
      const client = createRestAPIClient({
        url: `https://${auth.instance}`,
        accessToken: auth.token,
      });
      const statuses = await client.v1.timelines.home.list({ limit: 40 });
      setStatuses(statuses);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load timeline');
    }
  }, [auth.token, auth.instance]);

  useEffect(() => {
    setLoading(true);
    fetchTimeline().finally(() => setLoading(false));
  }, [fetchTimeline]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  }, [fetchTimeline]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomColor: border,
          },
        ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mastify</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          {auth.avatar ? <Avatar uri={auth.avatar} /> : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: secondary }]}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryBtn}>
            <Text style={{ color: colors.tint }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <LegendList
          data={statuses}
          renderItem={({ item }) => <PostCard status={item} />}
          keyExtractor={(item) => item.id}
          recycleItems
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: colors.tint, bottom: 16 }]}
        android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 28 }}>
        <Ionicons name="pencil" size={22} color="#fff" />
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
  headerAvatar: { width: 32, height: 32, borderRadius: 16 },
  card: { borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, marginTop: 2 },
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
