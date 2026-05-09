import { Ionicons } from '@expo/vector-icons';
import {
    Text,
    TouchableOpacity,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export function ActionItem({
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

const styles = StyleSheet.create({
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionCount: { fontSize: 13 },
});
