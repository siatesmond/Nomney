import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function PostHeaderOverlay({
    avatarUrl,
    username,
    locationName,
    onClose,
}: {
    avatarUrl: string | null;
    username: string | null;
    locationName: string | null;
    onClose: () => void;
}) {
    return (
        <View className="absolute top-12 left-3 right-3 flex-row items-center justify-between">
            <View
                className="flex-row items-center px-2.5 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(28,25,23,0.55)" }}
            >
                <Image
                    source={{ uri: avatarUrl || "https://via.placeholder.com/150" }}
                    className="w-7 h-7 rounded-full bg-slate-200"
                />
                <View style={{ marginLeft: 8 }}>
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>
                        {username || "food_reviewer"}
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
            </View>

            <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(28,25,23,0.55)" }}
                activeOpacity={0.7}
            >
                <Ionicons name="close" size={17} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}