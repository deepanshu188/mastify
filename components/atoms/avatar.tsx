import { Image } from 'expo-image';
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Avatar({ uri, style, onPress }: { uri: string; style?: object; onPress?: () => void }) {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
            <Image source={{ uri }} style={[styles.avatar, style]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    avatar: { width: 44, height: 44, borderRadius: 12 },
})