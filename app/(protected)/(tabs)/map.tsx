// Map tab: drops a small photo-card pin for every post of yours that has a
// location. Tapping a pin lets you view the post or open it in Google Maps.
import { PostDetailModal } from "@/components/post/PostDetailModal";
import { COLORS } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getUserPostLocations, PostLocation } from "@/lib/posts";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// Falls back to Singapore when you have no pinned posts yet.
const DEFAULT_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.4,
  longitudeDelta: 0.4,
};

// A small photo-card marker representing one post.
function PostMarker({
  loc,
  onPress,
}: {
  loc: PostLocation;
  onPress: () => void;
}) {
  // Redraw the marker until the image loads, then stop for performance.
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    if (!loc.imageUrl) setTracks(false);
  }, [loc.imageUrl]);

  return (
    <Marker
      coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
      onPress={onPress}
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View className="items-center">
        <View style={styles.markerCard}>
          {loc.imageUrl ? (
            <Image
              source={{ uri: loc.imageUrl }}
              style={styles.markerImg}
              // Wait a beat after load so the photo is actually painted into the
              // marker's bitmap snapshot before we stop tracking changes.
              onLoad={() => setTimeout(() => setTracks(false), 600)}
            />
          ) : (
            <View style={[styles.markerImg, styles.markerFallback]}>
              <Ionicons name="restaurant" size={18} color={COLORS.accent} />
            </View>
          )}
        </View>
        <View style={styles.markerPointer} />
      </View>
    </Marker>
  );
}

export default function MapScreen() {
  const { profile } = useAuthContext();
  const mapRef = useRef<MapView>(null);

  const [locations, setLocations] = useState<PostLocation[]>([]);
  const [selected, setSelected] = useState<PostLocation | null>(null);
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  // Reload pins whenever the tab is focused, so new posts show up.
  useFocusEffect(
    useCallback(() => {
      if (!profile?.id) return;
      let cancelled = false;
      (async () => {
        try {
          const data = await getUserPostLocations(profile.id);
          if (!cancelled) setLocations(data);
        } catch (err) {
          console.log("Failed to load post locations:", err);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile?.id]),
  );

  // Zoom the map to fit all the pins once they're loaded.
  useEffect(() => {
    if (locations.length && mapRef.current) {
      mapRef.current.fitToCoordinates(
        locations.map((l) => ({ latitude: l.latitude, longitude: l.longitude })),
        {
          edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
          animated: true,
        },
      );
    }
  }, [locations]);

  const openInGoogleMaps = (loc: PostLocation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
    Linking.openURL(url).catch(() => {});
    setSelected(null);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: COLORS.paper }}
    >
      <View className="px-5 pt-2 pb-3">
        <Text className="text-2xl font-bold" style={{ color: COLORS.ink }}>
          My Map
        </Text>
      </View>

      {/* Map card */}
      <View
        className="flex-1 mx-4 mb-4 rounded-3xl overflow-hidden"
        style={{ borderWidth: 1, borderColor: COLORS.line }}
      >
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={DEFAULT_REGION}
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pitchEnabled
          zoomControlEnabled
          onPress={() => setSelected(null)}
        >
          {locations.map((loc) => (
            <PostMarker
              key={loc.id}
              loc={loc}
              onPress={() => setSelected(loc)}
            />
          ))}
        </MapView>

        {locations.length === 0 && (
          <View className="absolute inset-0 items-center justify-center px-8">
            <Text style={{ color: COLORS.muted }} className="text-sm text-center">
              No pinned posts yet. Add a location to a post and it&apos;ll show
              up here.
            </Text>
          </View>
        )}
      </View>

      {/* Selected pin card */}
      {selected && (
        <View
          className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl p-4"
          style={{
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text
            style={{ color: COLORS.ink }}
            className="text-base font-bold"
            numberOfLines={1}
          >
            {selected.title}
          </Text>
          {!!selected.locationName && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-sharp" size={13} color={COLORS.accent} />
              <Text
                style={{ color: COLORS.muted }}
                className="text-xs ml-1 flex-1"
                numberOfLines={1}
              >
                {selected.locationName}
              </Text>
            </View>
          )}
          <View className="flex-row gap-3 mt-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center"
              style={{ backgroundColor: COLORS.accent }}
              activeOpacity={0.85}
              onPress={() => {
                setOpenPostId(selected.id);
                setSelected(null);
              }}
            >
              <Text className="text-white font-semibold text-sm">View post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center"
              style={{ borderWidth: 1, borderColor: COLORS.line }}
              activeOpacity={0.85}
              onPress={() => openInGoogleMaps(selected)}
            >
              <Text style={{ color: COLORS.ink }} className="font-semibold text-sm">
                Google Maps
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Post detail */}
      <Modal
        visible={!!openPostId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpenPostId(null)}
      >
        {openPostId && (
          <PostDetailModal
            postId={openPostId}
            onClose={() => setOpenPostId(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  markerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  markerImg: {
    width: 46,
    height: 46,
    borderRadius: 9,
    backgroundColor: "#eee",
  },
  markerFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accentSoft,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.accent,
    marginTop: -1,
  },
});
