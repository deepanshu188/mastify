import { Platform } from 'react-native';

const tintColorLight = '#0c294b';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    secondary: '#6b7280',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#cdd1d7',
    tabIconSelected: tintColorLight,
    border: '#e5e5e5',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    secondary: '#9BA1A6',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#cdd1d7',
    tabIconSelected: tintColorDark,
    border: '#2a2a2a',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
