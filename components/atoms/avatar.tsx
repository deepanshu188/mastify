import { Image } from 'expo-image';
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Avatar({ uri, style }: {uri: string, style?: object}) {
    return <TouchableOpacity activeOpacity={0.8}>
        <Image
            source={{ uri }}
            style={[styles.avatar, style]}
        />
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    avatar: { width: 32, height: 32, borderRadius: 12 },
})