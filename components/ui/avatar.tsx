import { Image } from 'expo-image';
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Avatar({ uri }: {uri: string}) {
    return <TouchableOpacity activeOpacity={0.8}>
        <Image
            source={{ uri }}
            style={styles.headerAvatar}
        />
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    headerAvatar: { width: 32, height: 32, borderRadius: 16 },
})