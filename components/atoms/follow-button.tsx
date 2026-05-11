import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  isFollowing: boolean;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function FollowButton({ isFollowing, loading, disabled, onPress }: Props) {
  const { theme } = useUnistyles();

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isFollowing
          ? { borderColor: theme.border, borderWidth: 1.5, backgroundColor: 'transparent' }
          : { backgroundColor: theme.tint },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? theme.secondary : theme.background} />
      ) : (
        <Text style={[styles.text, { color: isFollowing ? theme.text : theme.background }]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  text: { fontSize: 14, fontWeight: '600' },
});
