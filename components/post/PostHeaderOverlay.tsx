// The bar floating over the post photo: a back button, avatar + name (tap to
// open profile) with optional location, and edit/delete for the post owner.
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
    onPressLocation,
    onEdit,
    onDelete,
}: {
    avatarUrl: string | null;
    username: string | null;
    locationName: string | null;
    onClose: () => void;
    onPressProfile?: () => void;
    onPressLocation?: () => void;
    // Only passed when the current user owns the post.
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const displayName = username || "food_reviewer";
    return (
        <View
            pointerEvents="box-none"
            className="absolute top-12 left-3 right-3 flex-row items-center justify-between"
        >
            <View pointerEvents="box-none" className="flex-row items-center gap-2">
                <ScrimIconButton icon="chevron-back" onPress={onClose} />
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
                            <TouchableOpacity
                                className="flex-row items-center"
                                activeOpacity={0.7}
                                disabled={!onPressLocation}
                                onPress={onPressLocation}
                            >
                                <Ionicons name="location-sharp" size={10} color="#FFD9CC" />
                                <Text
                                    className="text-[10px] text-white/85 font-medium"
                                    numberOfLines={1}
                                    style={{ maxWidth: 140, marginLeft: 3 }}
                                >
                                    {locationName}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {(onEdit || onDelete) && (
                <View className="flex-row items-center gap-2">
                    {onEdit && (
                        <ScrimIconButton icon="create-outline" onPress={onEdit} />
                    )}
                    {onDelete && (
                        <ScrimIconButton icon="trash-outline" onPress={onDelete} />
                    )}
                </View>
            )}
        </View>
    );
}
