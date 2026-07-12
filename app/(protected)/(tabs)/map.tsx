import {
  CLUSTER_SIZE,
  ClusterBubble,
  PhotoCard,
} from "@/components/map/MapMarkers";
import {
  buildClusters,
  CARD_H,
  CARD_W,
  project,
  Size,
} from "@/components/map/mapMath";
import { SelectedPostsCard } from "@/components/map/SelectedPostsCard";
import { PostDetailModal } from "@/components/post/PostDetailModal";
import { LocationData } from "@/constants/new-post";
import { COLORS } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useNewPostLocation } from "@/hooks/useNewPostLocation";
import { countryForCoord } from "@/lib/geocode";
import { getPostLocations, MapScope, PostLocation } from "@/lib/posts";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

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

// Falls back to Singapore when have no pinned posts yet.
const DEFAULT_REGION: Region = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.4,
  longitudeDelta: 0.4,
};

const MAP_STYLE = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export default function MapScreen() {
  const { profile } = useAuthContext();

  const mapRef = useRef<MapView>(null);
  const [scope, setScope] = useState<MapScope>("mine");
  const [locationGranted, setLocationGranted] = useState(false);
  const [locations, setLocations] = useState<PostLocation[]>([]);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [mapSize, setMapSize] = useState<Size>({ width: 0, height: 0 });
  // The post(s) shown in the bottom card. Usually one; more than one when
  // several posts share the same spot (e.g. shops in the same mall).
  const [selectedPosts, setSelectedPosts] = useState<PostLocation[]>([]);
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  // Country per post (post id -> country name), filled by reverse-geocoding.
  const [postCountries, setPostCountries] = useState<Record<string, string>>({});
  // When there are lots of countries we show a searchable picker instead of chips.
  const [countryModal, setCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Google Places search (reused from the add-post flow) to jump anywhere.
  const {
    locationSearch,
    searchResults,
    searchLoading,
    onLocationSearchChange,
    searchLocation,
  } = useNewPostLocation();
  // A searched place that has no post of yours — shown as a plain pin.
  const [searchedPlace, setSearchedPlace] = useState<LocationData | null>(null);

  const goToSearchResult = (r: LocationData) => {
    onLocationSearchChange(""); // clear the box + results
    Keyboard.dismiss();
    mapRef.current?.animateToRegion(
      {
        latitude: r.latitude,
        longitude: r.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500,
    );

    // Match by place NAME, not coordinates. Shops in the same mall share almost
    // identical coordinates, so distance can't tell "Ghost Bingsu" from
    // "Ji De Chi" but a post made from a place stored that place's exact name.
    // If no post has that name, we just drop a pin.
    const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
    const target = norm(r.name);
    const match = locations.find((l) => norm(l.locationName) === target && target);
    if (match) {
      setSearchedPlace(null); // the post's own pin already marks the spot
      setSelectedPosts([match]);
    } else {
      setSelectedPosts([]);
      setSearchedPlace(r); // no post here just drop a pin
    }
  };

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

  // Zoom the map to fit all posts in the chosen country.
  const zoomToCountry = (country: string) => {
    const coords = locations
      .filter((l) => postCountries[l.id] === country)
      .map((l) => ({ latitude: l.latitude, longitude: l.longitude }));
    if (coords.length === 0) return;
    setSelectedPosts([]);
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

  // Tap a single card: show its info and fly/zoom the map to that spot.
  const focusLocation = (loc: PostLocation) => {
    setSelectedPosts([loc]);
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

  // Tap a cluster. If its posts are basically at the same spot (a mall, say),
  // zooming can't separate them — so show them all in the card to swipe
  // through. Otherwise, zoom in to fit them so they spread apart.
  const onClusterPress = (members: PostLocation[]) => {
    const [first] = members;
    const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
    // "Same place" = identical coordinates OR the same location name.
    const sameLocation = members.every(
      (m) =>
        (Math.abs(m.latitude - first.latitude) < 0.00005 &&
          Math.abs(m.longitude - first.longitude) < 0.00005) ||
        (norm(m.locationName) !== "" &&
          norm(m.locationName) === norm(first.locationName)),
    );
    if (sameLocation) {
      setSelectedPosts(members);
      mapRef.current?.animateToRegion(
        {
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400,
      );
    } else {
      mapRef.current?.fitToCoordinates(
        members.map((m) => ({ latitude: m.latitude, longitude: m.longitude })),
        {
          edgePadding: { top: 140, right: 100, bottom: 160, left: 100 },
          animated: true,
        },
      );
    }
  };

  const openInGoogleMaps = (loc: PostLocation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
    Linking.openURL(url).catch(() => { });
    setSelectedPosts([]);
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

        {/* Country picker — tap to zoom to that country's posts. Only shown
            once posts span more than one country. A short list shows as chips;
            a long list collapses into a searchable dropdown. */}
        {countries.length > 1 &&
          (countries.length <= 6 ? (
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
                  <Text
                    className="text-xs font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCountryModal(true)}
              className="mt-2 self-start flex-row items-center px-3 py-2 rounded-full"
              style={{
                borderWidth: 1,
                borderColor: COLORS.line,
                backgroundColor: "#fff",
              }}
            >
              <Ionicons name="earth" size={14} color={COLORS.accent} />
              <Text
                className="text-xs font-medium mx-1.5"
                style={{ color: COLORS.ink }}
              >
                Countries ({countries.length})
              </Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
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
          onPress={() => {
            setSelectedPosts([]);
            setSearchedPlace(null);
          }}
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
                    ? onClusterPress(c.members)
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

          {/* Pin for a searched place that has no post of yours. */}
          {searchedPlace &&
            (() => {
              const p = project(searchedPlace, region, mapSize);
              if (!p) return null;
              return (
                <View
                  style={{
                    position: "absolute",
                    left: p.x,
                    top: p.y,
                    width: 160,
                    alignItems: "center",
                    transform: [{ translateX: -80 }, { translateY: -70 }],
                  }}
                >
                  <View
                    className="bg-white rounded-xl px-2.5 py-1.5"
                    style={{
                      elevation: 3,
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 3,
                      shadowOffset: { width: 0, height: 2 },
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      className="text-[11px] font-semibold text-center"
                      style={{ color: COLORS.ink, maxWidth: 140 }}
                    >
                      {searchedPlace.name}
                    </Text>
                    <Text
                      className="text-[9px] text-center"
                      style={{ color: COLORS.muted }}
                    >
                      Currently no post here
                    </Text>
                  </View>
                  <Ionicons
                    name="location"
                    size={34}
                    color={COLORS.accent}
                    style={{ marginTop: -1 }}
                  />
                </View>
              );
            })()}
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

        {/* Location search — jump the map to any place (Google Places). */}
        <View className="absolute top-3 left-3" style={{ right: 60 }}>
          <View
            className="flex-row items-center bg-white rounded-full px-3"
            style={{
              height: 44,
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Ionicons name="search" size={16} color={COLORS.muted} />
            <TextInput
              className="flex-1 ml-2 text-sm"
              placeholder="Search a place…"
              placeholderTextColor={COLORS.muted}
              value={locationSearch}
              onChangeText={onLocationSearchChange}
              returnKeyType="search"
              onSubmitEditing={() => searchLocation(locationSearch)}
              style={{ color: COLORS.ink }}
            />
            {searchLoading ? (
              <ActivityIndicator size="small" color={COLORS.accent} />
            ) : locationSearch.length > 0 ? (
              <TouchableOpacity
                onPress={() => onLocationSearchChange("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {searchResults.length > 0 && (
            <View
              className="bg-white rounded-2xl mt-2 overflow-hidden"
              style={{
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              {searchResults.map((r, i) => (
                <TouchableOpacity
                  key={`${r.latitude}-${r.longitude}-${i}`}
                  className="px-3 py-3 flex-row items-center"
                  style={{
                    borderBottomWidth: i < searchResults.length - 1 ? 1 : 0,
                    borderColor: COLORS.line,
                  }}
                  onPress={() => goToSearchResult(r)}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={COLORS.accent}
                  />
                  <View className="ml-2 flex-1">
                    <Text
                      className="text-sm"
                      style={{ color: COLORS.ink }}
                      numberOfLines={1}
                    >
                      {r.name}
                    </Text>
                    {!!r.address && (
                      <Text
                        className="text-xs"
                        style={{ color: COLORS.muted }}
                        numberOfLines={1}
                      >
                        {r.address}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {locations.length === 0 && (
          <View className="absolute inset-0 items-center justify-center px-8">
            <Text style={{ color: COLORS.muted }} className="text-sm text-center">
              {EMPTY_TEXT[scope]}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom card(s) for the tapped pin. Keyed by the selection so its
          swipe position resets when you tap a different pin. */}
      {selectedPosts.length > 0 && (
        <SelectedPostsCard
          key={selectedPosts.map((p) => p.id).join("-")}
          posts={selectedPosts}
          showUser={scope !== "mine"}
          onOpenPost={(p) => {
            setOpenPostId(p.id);
            setSelectedPosts([]);
          }}
          onOpenMaps={openInGoogleMaps}
        />
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

      {/* Searchable country picker (used when there are many countries) */}
      <Modal
        visible={countryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModal(false)}
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            activeOpacity={1}
            onPress={() => setCountryModal(false)}
          />
          <View
            className="bg-white rounded-t-3xl px-5 pt-5 pb-8"
            style={{ maxHeight: "70%" }}
          >
            <Text className="text-base font-bold mb-3" style={{ color: COLORS.ink }}>
              Jump to a country
            </Text>
            <TextInput
              placeholder="Search country"
              placeholderTextColor={COLORS.muted}
              value={countrySearch}
              onChangeText={setCountrySearch}
              className="rounded-xl px-3 py-2 mb-3 text-sm"
              style={{ borderWidth: 1, borderColor: COLORS.line, color: COLORS.ink }}
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {countries
                .filter((c) =>
                  c.toLowerCase().includes(countrySearch.trim().toLowerCase()),
                )
                .map((c) => (
                  <TouchableOpacity
                    key={c}
                    className="py-3 flex-row items-center"
                    style={{ borderBottomWidth: 1, borderColor: COLORS.line }}
                    onPress={() => {
                      setCountryModal(false);
                      setCountrySearch("");
                      zoomToCountry(c);
                    }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={COLORS.accent}
                    />
                    <Text className="text-sm ml-2" style={{ color: COLORS.ink }}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
