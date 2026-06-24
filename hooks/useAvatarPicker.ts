import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

export function useAvatarPicker(initialUrl: string | null) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);
    const [localUri, setLocalUri] = useState<string | null>(null);

    const pickAvatar = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            return Alert.alert(
                "Permission denied",
                "We need access to your photos to change your avatar.",
            );
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const manip = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 512, height: 512 } }],
                { format: ImageManipulator.SaveFormat.JPEG, compress: 0.7 },
            );
            setLocalUri(manip.uri);
            setAvatarUrl(manip.uri); // preview immediately
        }
    };

    return { avatarUrl, localUri, pickAvatar };
}