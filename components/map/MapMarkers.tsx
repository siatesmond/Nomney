import { COLORS } from "@/constants/theme";
import { PostLocation } from "@/lib/posts";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { CARD_H, CARD_W } from "./mapMath";

export const CLUSTER_SIZE = 44;

// A single post: photo thumbnail + pointer. When `authorAvatar` is provided
// (Following / Everyone), a small avatar shows in the corner so can tell
// whose post it is. `null` avatar = show the fallback person icon.
export function PhotoCard({
  loc,
  authorAvatar,
}: {
  loc: PostLocation;
  authorAvatar?: string | null;
}) {
  return (
    <View style={{ width: CARD_W, height: CARD_H, alignItems: "center", paddingTop: 6 }}>
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          borderWidth: 3,
          borderColor: COLORS.accent,
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        {loc.imageUrl ? (
          <Image
            source={{ uri: loc.imageUrl }}
            style={{ width: 48, height: 48 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{ width: 48, height: 48, backgroundColor: COLORS.accent }}
            className="items-center justify-center"
          >
            <Ionicons name="restaurant" size={22} color="#fff" />
          </View>
        )}
      </View>
      {/* Little pointer so the photo reads as a pin. */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 7,
          borderRightWidth: 7,
          borderTopWidth: 9,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: COLORS.accent,
          marginTop: -1,
        }}
      />

      {/* Poster's avatar (only for Following / Everyone). */}
      {authorAvatar !== undefined && (
        <View
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#fff",
            backgroundColor: COLORS.accent,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={{ width: 20, height: 20 }} />
          ) : (
            <Ionicons name="person" size={12} color="#fff" />
          )}
        </View>
      )}
    </View>
  );
}

// A group of overlapping posts: a plain circle with the count. Tapping it zooms
// in until the posts separate into individual photo cards.
export function ClusterBubble({ count }: { count: number }) {
  return (
    <View
      style={{
        width: CLUSTER_SIZE,
        height: CLUSTER_SIZE,
        borderRadius: CLUSTER_SIZE / 2,
        backgroundColor: COLORS.accent,
        borderWidth: 3,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
        {count}
      </Text>
    </View>
  );
}
