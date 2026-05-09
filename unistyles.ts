import { StyleSheet } from 'react-native-unistyles';

import { Colors } from '@/constants/theme';

type AppTheme = typeof Colors.light;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: AppTheme;
    dark: AppTheme;
  }
}

StyleSheet.configure({
  themes: {
    light: Colors.light,
    dark: Colors.dark,
  },
  settings: {
    adaptiveThemes: true,
  },
});
