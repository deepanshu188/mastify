import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { IconSymbol } from '@/components/atoms/icon-symbol';

type TabConfig = {
  name: string;
  icon: 'home' | 'explore' | 'notifications' | 'message';
};

const TAB_ICONS: TabConfig[] = [
  { name: 'index', icon: 'home' },
  { name: 'explore', icon: 'explore' },
  { name: 'notifications', icon: 'notifications' },
  { name: 'messages', icon: 'message' },
];

export function NavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: theme.background, borderTopColor: theme.border }]}>
      {state.routes.map((route, index) => {
        const tab = TAB_ICONS.find((t) => t.name === route.name);
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? theme.tabIconSelected : theme.tabIconDefault;

        return (
          <PlatformPressable
            key={route.key}
            style={styles.tab}
            onPress={() => navigation.navigate(route.name)}
            onPressIn={() => {
              if (process.env.EXPO_OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}>
            <IconSymbol name={tab.icon} size={26} color={color} />
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
});
