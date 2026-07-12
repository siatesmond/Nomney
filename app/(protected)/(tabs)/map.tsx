// Map tab: drops a small photo-card pin for every post of yours that has a
// location. Tapping a pin lets you view the post or open it in Google Maps.
import { PostDetailModal } from "@/components/post/PostDetailModal";
import { COLORS } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getUserPostLocations, PostLocation } from "@/lib/posts";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// Falls back to Singapore when you have no pinned posts yet.
const DEFAULT_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.4,
  longitudeDelta: 0.4,
};

// Hide Google's own business/POI/transit pins so only our post pins show —
// gives the clean look of the Instagram / Snapchat map.
const MAP_STYLE = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export default function MapScreen() {
  const { profile } = useAuthContext();

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
          style={{ flex: 1 }}
          initialRegion={DEFAULT_REGION}
          customMapStyle={MAP_STYLE}
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pitchEnabled
          zoomControlEnabled
          clusterColor={COLORS.accent}
          clusterTextColor="#fff"
          radius={60}
          // The library's default cluster bubble renders blank on some devices,
          // so draw our own visible orange count bubble.
          renderCluster={(cluster: any) => {
            const { id, geometry, onPress, properties } = cluster;
            const [lng, lat] = geometry.coordinates;
            return (
              <Marker
                key={`cluster-${id}`}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={onPress}
                tracksViewChanges
              >
                <View style={styles.clusterBubble}>
                  <Text style={styles.clusterText}>
                    {properties.point_count}
                  </Text>
                </View>
              </Marker>
            );
          }}
          onPress={() => setSelected(null)}
        >
          {/* Markers must be DIRECT children of the map for clustering to
              detect them — don't wrap them in a custom component. */}
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              onPress={() => setSelected(loc)}
              tracksViewChanges
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerCard}>
                {loc.imageUrl ? (
                  <Image
                    source={{ uri: loc.imageUrl }}
                    style={styles.markerImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.markerImg, styles.markerFallback]}>
                    <Ionicons name="restaurant" size={22} color={COLORS.accent} />
                  </View>
                )}
              </View>
            </Marker>
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
  // Instagram-style portrait photo card. A real border defines the white frame
  // because marker shadows don't render into the pin bitmap on Android.
  markerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 3,
    // A thin dark hairline defines the white frame against a light map
    // (marker shadows don't render on Android).
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  markerImg: {
    width: 52,
    height: 68,
    borderRadius: 11,
    backgroundColor: "#eee",
  },
  markerFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accentSoft,
  },
  clusterBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  clusterText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
