// Map tab: shows each of your located posts as a little photo card
// (Instagram/Snapchat style). Tapping one lets you view the post or open it in
// Google Maps.
//
// The photo cards are drawn as normal views layered ON TOP of the map (not as
// native map markers). react-native-maps custom markers render blank/clipped on
// the New Architecture, so instead we project each coordinate to a screen
// position ourselves and drop an ordinary view there — ordinary views never
// clip. We recompute those positions on every region change so the cards track
// the map live while you drag/zoom. (This flat projection assumes the map isn't
// rotated or tilted, so those gestures are disabled.)
import { PostDetailModal } from "@/components/post/PostDetailModal";
import { COLORS } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { getPostLocations, MapScope, PostLocation } from "@/lib/posts";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// The three map scopes and their button labels.
const SCOPES: { key: MapScope; label: string }[] = [
  { key: "mine", label: "Mine" },
  { key: "following", label: "Following" },
  { key: "everyone", label: "Everyone" },
];

const EMPTY_TEXT: Record<MapScope, string> = {
  mine: "No pinned posts yet. Add a location to a post and it'll show up here.",
  following: "No located posts from people you follow yet.",
  everyone: "No located posts yet.",
};

// Country isn't stored on posts, so we reverse-geocode each coordinate to find
// it. Cached by rounded coordinate so we don't geocode the same spot twice.
// (Reverse geocoding doesn't need location permission.)
const countryCache = new Map<string, string | null>();

async function countryForCoord(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  if (countryCache.has(key)) return countryCache.get(key) ?? null;
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const country = place?.country ?? null;
    countryCache.set(key, country);
    return country;
  } catch {
    return null;
  }
}

// Falls back to Singapore when you have no pinned posts yet.
const DEFAULT_REGION: Region = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.4,
  longitudeDelta: 0.4,
};

// Hide Google's own business/POI/transit pins so only our post cards show —
// gives the clean look of the Instagram / Snapchat map.
const MAP_STYLE = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

// Card size, used both for the visual and to anchor its bottom on the point.
const CARD_W = 62;
const CARD_H = 72;

type Size = { width: number; height: number };

// Turn a lat/long into an x/y on the map view, using the visible region and the
// map's pixel size. Returns null if we don't know the size yet or it's well off
// screen. Linear projection — accurate enough at city zoom, no rotation/tilt.
function project(
  loc: PostLocation,
  region: Region,
  size: Size,
): { x: number; y: number } | null {
  const { width, height } = size;
  if (!width || !height) return null;

  const leftLng = region.longitude - region.longitudeDelta / 2;
  const topLat = region.latitude + region.latitudeDelta / 2;
  const x = ((loc.longitude - leftLng) / region.longitudeDelta) * width;
  const y = ((topLat - loc.latitude) / region.latitudeDelta) * height;

  // Skip cards that are far outside the visible area.
  if (x < -CARD_W || x > width + CARD_W || y < -CARD_H || y > height + CARD_H) {
    return null;
  }
  return { x, y };
}

type Cluster = {
  id: string;
  x: number;
  y: number;
  members: PostLocation[];
};

// Cards whose on-screen points are within this many pixels get merged into a
// cluster (roughly "they'd visually overlap").
const CLUSTER_PX = 56;

// Group the visible posts into clusters based on how close they are on screen.
// Recomputed every region change, so clusters split apart as you zoom in.
function buildClusters(
  locations: PostLocation[],
  region: Region,
  size: Size,
): Cluster[] {
  const pts = locations
    .map((loc) => ({ loc, p: project(loc, region, size) }))
    .filter((e): e is { loc: PostLocation; p: { x: number; y: number } } => !!e.p);

  const clusters: Cluster[] = [];
  const used = new Set<string>();

  for (let i = 0; i < pts.length; i++) {
    if (used.has(pts[i].loc.id)) continue;
    const group = [pts[i]];
    used.add(pts[i].loc.id);

    for (let j = i + 1; j < pts.length; j++) {
      if (used.has(pts[j].loc.id)) continue;
      const dx = pts[i].p.x - pts[j].p.x;
      const dy = pts[i].p.y - pts[j].p.y;
      if (Math.hypot(dx, dy) < CLUSTER_PX) {
        group.push(pts[j]);
        used.add(pts[j].loc.id);
      }
    }

    const x = group.reduce((s, g) => s + g.p.x, 0) / group.length;
    const y = group.reduce((s, g) => s + g.p.y, 0) / group.length;
    clusters.push({
      id: group[0].loc.id,
      x,
      y,
      members: group.map((g) => g.loc),
    });
  }
  return clusters;
}

const CLUSTER_SIZE = 44;

// A single post: photo thumbnail + pointer. When `authorAvatar` is provided
// (Following / Everyone), a small avatar shows in the corner so you can tell
// whose post it is. `null` avatar = show the fallback person icon.
function PhotoCard({
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
function ClusterBubble({ count }: { count: number }) {
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

export default function MapScreen() {
  const { profile } = useAuthContext();

  const mapRef = useRef<MapView>(null);
  const [scope, setScope] = useState<MapScope>("mine");
  const [locationGranted, setLocationGranted] = useState(false);
  const [locations, setLocations] = useState<PostLocation[]>([]);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [mapSize, setMapSize] = useState<Size>({ width: 0, height: 0 });
  const [selected, setSelected] = useState<PostLocation | null>(null);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  // Gallery state for the tapped-card photo swiper.
  const [mediaW, setMediaW] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Country per post (post id -> country name), filled by reverse-geocoding.
  const [postCountries, setPostCountries] = useState<Record<string, string>>({});

  // Reload pins whenever the tab is focused or the scope changes.
  useFocusEffect(
    useCallback(() => {
      if (!profile?.id) return;
      let cancelled = false;
      (async () => {
        try {
          const data = await getPostLocations(scope, profile.id);
          if (!cancelled) setLocations(data);
        } catch (err) {
          console.log("Failed to load post locations:", err);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile?.id, scope]),
  );

  // Figure out each post's country (for the country chips) whenever the pins
  // change. Runs in the background; cached so it's cheap on repeat.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries: [string, string][] = [];
      for (const loc of locations) {
        const country = await countryForCoord(loc.latitude, loc.longitude);
        if (country) entries.push([loc.id, country]);
      }
      if (!cancelled) setPostCountries(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [locations]);

  // The distinct countries present, sorted for the chip row.
  const countries = useMemo(
    () => Array.from(new Set(Object.values(postCountries))).sort(),
    [postCountries],
  );

  // Fly/zoom the map to fit all posts in the chosen country.
  const zoomToCountry = (country: string) => {
    const coords = locations
      .filter((l) => postCountries[l.id] === country)
      .map((l) => ({ latitude: l.latitude, longitude: l.longitude }));
    if (coords.length === 0) return;
    setSelected(null);
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 140, right: 80, bottom: 160, left: 80 },
      animated: true,
    });
  };

  // Center the map on the user's current GPS location (asking permission the
  // first time). Turning permission on also shows the blue "you are here" dot.
  const recenterToMe = async () => {
    try {
      let granted = locationGranted;
      if (!granted) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        granted = status === "granted";
        setLocationGranted(granted);
      }
      if (!granted) {
        return Alert.alert(
          "Location needed",
          "Turn on location access to center the map on you.",
        );
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500,
      );
    } catch {
      Alert.alert("Location error", "Couldn't get your current location.");
    }
  };

  // Tap a card: show its info and fly/zoom the map to that spot.
  const focusLocation = (loc: PostLocation) => {
    setSelected(loc);
    setPhotoIndex(0);
    mapRef.current?.animateToRegion(
      {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500,
    );
  };

  // Tap a cluster: zoom the map to fit its members so they spread apart.
  const zoomToCluster = (members: PostLocation[]) => {
    mapRef.current?.fitToCoordinates(
      members.map((m) => ({ latitude: m.latitude, longitude: m.longitude })),
      {
        edgePadding: { top: 140, right: 100, bottom: 160, left: 100 },
        animated: true,
      },
    );
  };

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
        <View className="flex-row items-center gap-1 mb-2">
          <Image
            source={require("@/assets/images/icon/mascotWithMap.png")}
            style={{ width: 56, height: 56 }}
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold" style={{ color: COLORS.ink }}>
            Foodprints
          </Text>
        </View>

        {/* Scope toggle: Mine / Following / Everyone */}
        <View
          className="flex-row rounded-full p-1"
          style={{ backgroundColor: "#EEE" }}
        >
          {SCOPES.map(({ key, label }) => {
            const active = scope === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => setScope(key)}
                className="flex-1 py-2 rounded-full items-center"
                style={active ? { backgroundColor: COLORS.accent } : undefined}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: active ? "#fff" : COLORS.muted }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Country chips — tap to zoom to that country's posts. Only shown
            once posts span more than one country. */}
        {countries.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {countries.map((c) => (
              <TouchableOpacity
                key={c}
                activeOpacity={0.8}
                onPress={() => zoomToCountry(c)}
                className="px-3 py-1.5 rounded-full"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.line,
                  backgroundColor: "#fff",
                }}
              >
                <Text className="text-xs font-medium" style={{ color: COLORS.ink }}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
          customMapStyle={MAP_STYLE}
          zoomEnabled
          scrollEnabled
          rotateEnabled={false}
          pitchEnabled={false}
          zoomControlEnabled
          showsUserLocation={locationGranted}
          showsMyLocationButton={false}
          onPress={() => setSelected(null)}
          onLayout={(e) => setMapSize(e.nativeEvent.layout)}
          onRegionChange={setRegion}
        />

        {/* Photo cards drawn on top of the map. box-none lets map gestures
            through except when they land on a card. */}
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="box-none"
        >
          {buildClusters(locations, region, mapSize).map((c) => {
            const isCluster = c.members.length > 1;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                onPress={() =>
                  isCluster
                    ? zoomToCluster(c.members)
                    : focusLocation(c.members[0])
                }
                style={{
                  position: "absolute",
                  left: c.x,
                  top: c.y,
                  // Clusters: centre the circle on the point. Single cards:
                  // anchor the pointer (bottom-centre) on the point.
                  transform: isCluster
                    ? [
                        { translateX: -CLUSTER_SIZE / 2 },
                        { translateY: -CLUSTER_SIZE / 2 },
                      ]
                    : [{ translateX: -CARD_W / 2 }, { translateY: -CARD_H }],
                }}
              >
                {isCluster ? (
                  <ClusterBubble count={c.members.length} />
                ) : (
                  <PhotoCard
                    loc={c.members[0]}
                    authorAvatar={
                      scope !== "mine"
                        ? (c.members[0].avatarUrl ?? null)
                        : undefined
                    }
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recenter-to-me button */}
        <TouchableOpacity
          onPress={recenterToMe}
          activeOpacity={0.85}
          className="absolute top-3 right-3 w-11 h-11 rounded-full items-center justify-center bg-white"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Ionicons name="locate" size={20} color={COLORS.accent} />
        </TouchableOpacity>

        {locations.length === 0 && (
          <View className="absolute inset-0 items-center justify-center px-8">
            <Text style={{ color: COLORS.muted }} className="text-sm text-center">
              {EMPTY_TEXT[scope]}
            </Text>
          </View>
        )}
      </View>

      {/* Selected card */}
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
          {selected.imageUrls.length > 0 && (
            <View
              onLayout={(e) => setMediaW(e.nativeEvent.layout.width)}
              style={{ marginBottom: 10 }}
            >
              {mediaW > 0 && (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) =>
                    setPhotoIndex(
                      Math.round(e.nativeEvent.contentOffset.x / mediaW),
                    )
                  }
                  style={{ borderRadius: 12, backgroundColor: "#fff" }}
                >
                  {/* contain (not cover) so the whole photo shows, uncropped. */}
                  {selected.imageUrls.map((url, i) => (
                    <Image
                      key={i}
                      source={{ uri: url }}
                      style={{ width: mediaW, height: 240 }}
                      resizeMode="contain"
                    />
                  ))}
                </ScrollView>
              )}

              {/* Page dots when there's more than one photo. */}
              {selected.imageUrls.length > 1 && (
                <View className="flex-row justify-center mt-2">
                  {selected.imageUrls.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: i === photoIndex ? 16 : 6,
                        height: 6,
                        borderRadius: 3,
                        marginHorizontal: 3,
                        backgroundColor:
                          i === photoIndex ? COLORS.accent : COLORS.line,
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
          <Text
            style={{ color: COLORS.ink }}
            className="text-base font-bold"
            numberOfLines={1}
          >
            {selected.title}
          </Text>
          {scope !== "mine" && !!selected.username && (
            <Text style={{ color: COLORS.muted }} className="text-xs mt-0.5">
              by @{selected.username}
            </Text>
          )}
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
