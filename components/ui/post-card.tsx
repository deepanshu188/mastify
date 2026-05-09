import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { mastodon } from 'masto';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet } from 'react-native-unistyles';
import { Avatar } from './avatar';

function PostContent({ text, tint }: { text: string; tint: string; textColor: string }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const parts = text.split(/(@[\w@.]+|#\w+)/g);
  return (
    <Text style={[styles.postText, { color: colors.text }]}>
      {parts.map((part, i) =>
        part.startsWith('@') || part.startsWith('#') ? (
          <Text key={i} style={{ color: tint }}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

function ActionItem({
  icon,
  count,
  color,
  active,
  activeColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
  color: string;
  active?: boolean;
  activeColor?: string;
}) {
  const c = active && activeColor ? activeColor : color;
  return (
    <TouchableOpacity style={styles.actionItem} activeOpacity={0.6}>
      <Ionicons name={active ? (icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap) : icon} size={18} color={c} />
      {count !== undefined && count > 0 && (
        <Text style={[styles.actionCount, { color: c }]}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

export function PostCard({ status }: { status: mastodon.v1.Status }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const secondary = colorScheme === 'dark' ? '#9BA1A6' : '#6b7280';
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0';

  const isBoost = !!status.reblog;
  const post = isBoost ? status.reblog! : status;
  const booster = isBoost ? status.account : null;

  function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

  const text = stripHtml(post.content);
  const firstImage = post.mediaAttachments.find((a: {type: string}) => a.type === 'image' || a.type === 'gifv');
  const previewUrl = firstImage?.previewUrl ?? firstImage?.url ?? null;

  function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

  return (
    <View style={[styles.card, { borderBottomColor: border }]}>
      {booster && (
        <View style={styles.boostRow}>
          <Ionicons name="repeat" size={14} color={secondary} style={styles.boostIcon} />
          <Image source={{ uri: booster.avatarStatic }} style={styles.boostAvatar} />
          <Text style={[styles.boostText, { color: secondary }]} numberOfLines={1}>
            {booster.displayName || booster.acct} boosted
          </Text>
          <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.6}>
            <Ionicons
              name={post.bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={post.bookmarked ? colors.tint : secondary}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.postBody}>
        {/* <Image source={{ uri: post.account.avatarStatic }} style={styles.avatar} /> */}
        <Avatar uri={post.account.avatarStatic} style={styles.avatar} />

        <View style={styles.postMain}>
          <View style={styles.authorRow}>
            <Text style={[styles.displayName, { color: colors.text }]} numberOfLines={1}>
              {post.account.displayName || post.account.acct}
            </Text>
            <Text style={[styles.timeAgo, { color: secondary }]}>{timeAgo(post.createdAt)}</Text>
          </View>
          <Text style={[styles.handle, { color: secondary }]} numberOfLines={1}>
            @{post.account.acct}
          </Text>

          {text.length > 0 && (
            <PostContent text={text} tint={colors.tint} textColor={colors.text} />
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
                color={secondary}
              />
              <ActionItem
                icon="heart-outline"
                count={post.favouritesCount}
                color={secondary}
                active={post.favourited ?? false}
                activeColor="#e11d48"
              />
              <ActionItem
                icon="repeat-outline"
                count={post.reblogsCount}
                color={secondary}
                active={post.reblogged ?? false}
                activeColor={colors.tint}
              />
            </View>
            {!booster && (
              <TouchableOpacity activeOpacity={0.6}>
                <Ionicons
                  name={post.bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={post.bookmarked ? colors.tint : secondary}
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
  avatar: { width: 44, height: 44, marginRight: 12, marginTop: 2 },
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
  postText: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
  media: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsLeft: { flexDirection: 'row', gap: 20 },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 13 },
});
