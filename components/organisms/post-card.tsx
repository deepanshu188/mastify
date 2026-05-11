import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { mastodon } from 'masto';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useMastoClient } from '@/hooks/use-masto-client';
import { timeAgo } from '@/utils/time';
import { Dispatch, SetStateAction } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ActionItem } from '../atoms/action-item';
import { Avatar } from '../atoms/avatar';
import { PostContent } from '../molecules/post-content';

export function PostCard({ status, setStatuses }: {
  status: mastodon.v1.Status;
  setStatuses: Dispatch<SetStateAction<mastodon.v1.Status[]>>;
}) {
  const { theme } = useUnistyles()
  const client = useMastoClient()

  const isBoost = !!status.reblog;
  const post = isBoost ? status.reblog! : status;
  const booster = isBoost ? status.account : null;

  async function toggleAction(
    activeField: 'favourited' | 'reblogged',
    countField: 'favouritesCount' | 'reblogsCount',
    doAction: (statusApi: ReturnType<NonNullable<typeof client>['v1']['statuses']['$select']>, next: boolean) => Promise<mastodon.v1.Status>,
  ) {
    if (!client) return;
    const statusApi = client.v1.statuses.$select(post.id);
    const next = !post[activeField];
    const originalCount = post[countField];

    const updateInTimeline = (mapper: (s: mastodon.v1.Status) => mastodon.v1.Status) =>
      setStatuses(prev => prev.map(s =>
        s.id === post.id ? mapper(s) :
        s.reblog?.id === post.id ? { ...s, reblog: mapper(s.reblog!) } :
        s
      ));

    updateInTimeline(s => ({ ...s, [activeField]: next, [countField]: s[countField] + (next ? 1 : -1) }));
    try {
      const updated = await doAction(statusApi, next);
      updateInTimeline(() => updated);
    } catch {
      updateInTimeline(s => ({ ...s, [activeField]: !next, [countField]: originalCount }));
    }
  }

  const firstImage = post.mediaAttachments.find((a: { type: string }) => a.type === 'image' || a.type === 'gifv');
  const previewUrl = firstImage?.previewUrl ?? firstImage?.url ?? null;

  return (
    <View style={[styles.card, { borderBottomColor: theme.border }]}>
      {booster && (
        <View style={styles.boostRow}>
          <Ionicons name="repeat" size={14} color={theme.secondary} style={styles.boostIcon} />
          <Image source={{ uri: booster.avatarStatic }} style={styles.boostAvatar} />
          <Text style={[styles.boostText, { color: theme.secondary }]} numberOfLines={1}>
            {booster.displayName || booster.acct} boosted
          </Text>
          <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.6}>
            <Ionicons
              name={post.bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={post.bookmarked ? theme.tint : theme.secondary}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.postBody}>
        <Avatar uri={post.account.avatarStatic} style={styles.avatar} />

        <View style={styles.postMain}>
          <View style={styles.authorRow}>
            <Text style={[styles.displayName, { color: theme.text }]} numberOfLines={1}>
              {post.account.displayName || post.account.acct}
            </Text>
            <Text style={[styles.timeAgo, { color: theme.secondary }]}>{timeAgo(post.createdAt)}</Text>
          </View>
          <Text style={[styles.handle, { color: theme.secondary }]} numberOfLines={1}>
            @{post.account.acct}
          </Text>

          {post.content.length > 0 && (
            <PostContent html={post.content} tint={theme.tint} textColor={theme.text} />
          )}

          {previewUrl && (
            <Image
              source={{ uri: previewUrl }}
              style={styles.media}
              contentFit="cover"
            />
          )}

          <View style={styles.actions}>
            <View style={styles.actionsLeft}>
              <ActionItem
                icon="chatbubble-outline"
                count={post.repliesCount}
                color={theme.secondary}
              />
              <ActionItem
                icon="heart-outline"
                count={post.favouritesCount}
                color={theme.secondary}
                active={post.favourited ?? false}
                activeColor="#e11d48"
                size={21}
                onPress={() => toggleAction(
                  'favourited', 'favouritesCount',
                  (statusApi, next) => next ? statusApi.favourite() : statusApi.unfavourite(),
                )}
              />
              <ActionItem
                icon="repeat-outline"
                count={post.reblogsCount}
                color={theme.secondary}
                active={post.reblogged ?? false}
                activeColor="#22c55e"
                size={23}
                onPress={() => toggleAction(
                  'reblogged', 'reblogsCount',
                  (statusApi, next) => (next ? statusApi.reblog() : statusApi.unreblog()).then(u => u.reblog ?? u),
                )}
              />
            </View>
            {!booster && (
              <TouchableOpacity activeOpacity={0.6}>
                <Ionicons
                  name="share-outline"
                  size={19}
                  color={theme.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  boostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  boostIcon: { marginRight: 4 },
  boostAvatar: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
  boostText: { fontSize: 13, flex: 1 },
  bookmarkBtn: { padding: 4 },
  postBody: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12 },
  avatar: { marginRight: 12, marginTop: 2 },
  postMain: { flex: 1 },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  displayName: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  timeAgo: { fontSize: 13 },
  handle: { fontSize: 13, marginBottom: 8 },
  media: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsLeft: { flexDirection: 'row', gap: 20 },
});
