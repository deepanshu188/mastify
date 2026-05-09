import { OpaqueColorValue, type StyleProp, type ViewStyle } from 'react-native';

import ExploreIcon from '@/assets/icons/explore.svg';
import HomeIcon from '@/assets/icons/home.svg';
import MessageIcon from '@/assets/icons/message.svg';
import NotificationIcon from '@/assets/icons/notification.svg';

type IconName = 'home' | 'explore' | 'notifications' | 'message';

const SVG_ICONS: Partial<Record<IconName, React.FC<{ width?: number; height?: number; color?: string }>>> = {
  home: HomeIcon,
  explore: ExploreIcon,
  notifications: NotificationIcon,
  message: MessageIcon
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;

}) {
  const SvgIcon = SVG_ICONS[name];
  if (SvgIcon) {
    return <SvgIcon width={size} height={size} color={color as string} />;
  }
}
