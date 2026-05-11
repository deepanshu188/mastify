import { Ionicons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { MastoAccount, MastoRelationship, MastoStatus } from '@/types/mastodon';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PostCard } from '@/components/organisms/post-card';
import { PostContent } from '@/components/molecules/post-content';
import { FollowButton } from '@/components/atoms/follow-button';
import { useMastoClient } from '@/hooks/use-masto-client';

type Tab = 'posts' | 'replies' | 'media';

const BANNER_HEIGHT = 150;
const AVATAR_SIZE = 72;
const AVATAR_OVERLAP = 36;

export default function ProfileScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const router = useRouter();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const client = useMastoClient();

  const [account, setAccount] = useState<MastoAccount | null>(null);
  const [relationship, setRelationship] = useState<MastoRelationship | null>(null);
  const [statuses, setStatuses] = useState<MastoStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [followLoading, setFollowLoading] = useState(false);

  const navigateToProfile = (id: string) =>
    router.push({ pathname: '/profile/[accountId]', params: { accountId: id } });

  useEffect(() => {
    if (!client || !accountId) return;
    setLoading(true);
    Promise.all([
      client.v1.accounts.$select(accountId).fetch(),
      client.v1.accounts.relationships.fetch({ id: [accountId] }),
    ])
      .then(([acc, rels]) => {
        setAccount(acc);
        setRelationship(rels[0] ?? null);
      })
      .finally(() => setLoading(false));
  }, [!!client, accountId]);

  useEffect(() => {
    if (!client || !accountId) return;
    setStatusesLoading(true);
    setHasMore(true);
    const params: Record<string, unknown> = { limit: 40 };
    if (activeTab === 'media') params.onlyMedia = true;
    if (activeTab === 'posts') params.excludeReplies = true;
    (client.v1.accounts.$select(accountId).statuses.list(params as never) as unknown as Promise<MastoStatus[]>)
      .then(result => {
        setStatuses(result);
        setHasMore(result.length >= 40);
      })
      .finally(() => setStatusesLoading(false));
  }, [!!client, accountId, activeTab]);

  const fetchMore = async () => {
    if (loadingMore || !hasMore || statuses.length === 0 || !client || !accountId) return;
    setLoadingMore(true);
    try {
      const maxId = statuses[statuses.length - 1].id;
      const params: Record<string, unknown> = { limit: 40, maxId };
      if (activeTab === 'media') params.onlyMedia = true;
      if (activeTab === 'posts') params.excludeReplies = true;
      const result = await (client.v1.accounts.$select(accountId).statuses.list(params as never) as unknown as Promise<MastoStatus[]>);
      setStatuses(prev => [...prev, ...result]);
      setHasMore(result.length >= 40);
    } catch (e) {
      console.error('fetchMore error:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  async function toggleFollow() {
    if (!client || !accountId || !relationship) return;
    setFollowLoading(true);
    try {
      const updated = relationship.following
        ? await client.v1.accounts.$select(accountId).unfollow()
        : await client.v1.accounts.$select(accountId).follow();
      setRelationship(updated);
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!account) return null;

  const joinedDate = new Date(account.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isFollowing = relationship?.following ?? false;

  const ListHeader = (
    <>
      <Image
        source={{ uri: account.header }}
        style={styles.banner}
        contentFit="cover"
      />

      <View style={[styles.avatarFollowRow, { backgroundColor: theme.background }]}>
        <Image
          source={{ uri: account.avatarStatic }}
          style={[styles.avatar, { borderColor: theme.background }]}
        />
        <FollowButton
          isFollowing={isFollowing}
          loading={followLoading}
          disabled={followLoading || !relationship}
          onPress={toggleFollow}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.displayName, { color: theme.text }]} numberOfLines={1}>
          {account.displayName || account.username}
        </Text>
        <Text style={[styles.handle, { color: theme.secondary }]} numberOfLines={1}>
          @{account.acct}
        </Text>

        <View style={styles.joinedRow}>
          <Ionicons name="calendar-outline" size={13} color={theme.secondary} />
          <Text style={[styles.joinedText, { color: theme.secondary }]}>Joined {joinedDate}</Text>
        </View>

        {account.note && account.note !== '<p></p>' && (
          <View style={styles.bio}>
            <PostContent html={account.note} tint={theme.tint} textColor={theme.text} />
          </View>
        )}

        {account.fields && account.fields.length > 0 && (
          <View style={[styles.fields, { borderColor: theme.border }]}>
            {account.fields.map((field, i) => (
              <View
                key={i}
                style={[styles.fieldRow, i < account.fields.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}
              >
                <Text style={[styles.fieldName, { color: theme.secondary }]}>{field.name}</Text>
                <View style={styles.fieldValue}>
                  <PostContent html={field.value} tint={theme.tint} textColor={theme.text} />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.statsRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: theme.text }]}>{account.statusesCount.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>Posts</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: theme.text }]}>{account.followersCount.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>Followers</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: theme.text }]}>{account.followingCount.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>Following</Text>
          </View>
        </View>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {(['posts', 'replies', 'media'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? theme.tint : theme.secondary }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {activeTab === tab && (
              <View style={[styles.tabIndicator, { backgroundColor: theme.tint }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {statusesLoading && (
        <ActivityIndicator size="small" color={theme.tint} style={styles.statusSpinner} />
      )}
    </>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      <LegendList
        data={statuses}
        renderItem={({ item }) => (
          <PostCard status={item} setStatuses={setStatuses} onAuthorPress={navigateToProfile} />
        )}
        keyExtractor={(item) => item.id}
        recycleItems
        ListHeaderComponent={ListHeader}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color={theme.tint} style={styles.footerSpinner} /> : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: { width: '100%', height: BANNER_HEIGHT },
  backBtn: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFollowRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -AVATAR_OVERLAP,
    paddingBottom: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 16,
    borderWidth: 3,
  },
  info: { paddingHorizontal: 16, paddingBottom: 4 },
  displayName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  handle: { fontSize: 14, marginBottom: 8 },
  joinedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  joinedText: { fontSize: 13 },
  bio: { marginBottom: 10 },
  fields: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
  },
  fieldRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  fieldName: { fontSize: 13, fontWeight: '600', width: 80 },
  fieldValue: { flex: 1 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 2,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statNum: { fontSize: 17, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 1 },
  statDivider: { width: StyleSheet.hairlineWidth },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    borderRadius: 1,
  },
  statusSpinner: { paddingVertical: 24 },
  footerSpinner: { paddingVertical: 16 },
});
