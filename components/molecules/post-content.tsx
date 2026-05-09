import {
    Text,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export function PostContent({ text, tint }: { text: string; tint: string; textColor: string }) {
  const { theme } = useUnistyles()
  const parts = text.split(/(@[\w@.]+|#\w+)/g);
  return (
    <Text style={[styles.postText, { color: theme.text }]}>
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

const styles = StyleSheet.create({
  postText: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
});