// The bar floating over the post photo: avatar + name (tap to open profile),
// optional location, and a close button.
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/UserAvatar";
import { ScrimIconButton } from "@/components/ui/ScrimIconButton";
import { SCRIM } from "@/constants/theme";

export function PostHeaderOverlay({
    avatarUrl,
    username,
    locationName,
    onClose,
    onPressProfile,
}: {
    avatarUrl: string | null;
    username: string | null;
    locationName: string | null;
    onClose: () => void;
    onPressProfile?: () => void;
}) {
    const displayName = username || "food_reviewer";
    return (
        <View className="absolute top-12 left-3 right-3 flex-row items-center justify-between">
            <TouchableOpacity
                className="flex-row items-center px-2.5 py-1.5 rounded-full"
                style={{ backgroundColor: SCRIM }}
                activeOpacity={0.7}
                disabled={!onPressProfile}
                onPress={onPressProfile}
            >
                <Avatar
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    size="xs"
                    shadow={false}
                />
                <View style={{ marginLeft: 8 }}>
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>
                        {displayName}
                    </Text>
                    {locationName && (
                        <View className="flex-row items-center">
                            <Ionicons name="location-sharp" size={10} color="#FFD9CC" />
                            <Text
                                className="text-[10px] text-white/85 font-medium"
                                numberOfLines={1}
                                style={{ maxWidth: 160, marginLeft: 3 }}
                            >
                                {locationName}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <ScrimIconButton icon="close" onPress={onClose} />
        </View>
    );
}
