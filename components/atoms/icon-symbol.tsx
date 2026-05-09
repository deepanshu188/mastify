import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';


export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: 'home' | 'explore' | 'notifications' | 'mail';
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={name} style={style} />;
}
