import { parseContent } from '@/utils/html';
import { Linking, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export function PostContent({ html, tint }: { html: string; tint: string; textColor: string }) {
  const { theme } = useUnistyles();
  const segments = parseContent(html);

  return (
    <Text style={[styles.postText, { color: theme.text }]}>
      {segments.map((seg, i) => {
        if (seg.type === 'hashtag') {
          return <Text key={i} style={{ color: '#3b82f6' }}>{seg.content}</Text>;
        }
        if (seg.type === 'mention') {
          return <Text key={i} style={{ color: '#3b82f6' }}>{seg.content}</Text>;
        }
        if (seg.type === 'link') {
          return (
            <Text
              key={i}
              style={{ color: '#3b82f6', textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL(seg.href)}
            >
              {seg.content}
            </Text>
          );
        }
        return seg.content;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  postText: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
});