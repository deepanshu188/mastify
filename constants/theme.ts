import { Platform } from 'react-native';

const tintColorLight = '#0c294b';
const tintColorDark = '#fff';

const fontFamilies = Platform.select({
  ios: {
    sans: 'PingFang SC',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: "'PingFang SC', 'sans-serif'",
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})!;

export const Fonts = fontFamilies;

const sharedColors = {
  fonts: fontFamilies,
  tintColorDefault: '#0c294b',
};

export const Colors = {
  light: {
    ...sharedColors,
    text: '#11181C',
    background: '#fff',
    secondary: '#6b7280',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#cdd1d7',
    tabIconSelected: tintColorLight,
    border: '#e5e5e5',
    logoColor: '#081B34',
  },
  dark: {
    ...sharedColors,
    text: '#ECEDEE',
    background: '#151718',
    secondary: '#9BA1A6',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#3c3c3c',
    tabIconSelected: tintColorDark,
    border: '#2a2a2a',
    logoColor: '#ffffff',
  },
};
