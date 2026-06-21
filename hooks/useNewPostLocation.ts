import * as Location from "expo-location";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import { GOOGLE_PLACES_API_KEY, LocationData } from "../constants/new-post";

const formatLocationName = (p: Location.LocationGeocodedAddress) =>
  [p.name && !/^\d+/.test(p.name) ? p.name : p.district, p.city, p.region]
    .filter(Boolean)
    .join(", ");

export function useNewPostLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | number>(
    undefined,
  );

  const resetSearch = () => {
    setSearchResults([]);
    setLocationSearch("");
  };

  const useCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permission denied");

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [place] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setLocation({
        name: formatLocationName(place),
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      resetSearch();
    } catch (err: any) {
      Alert.alert(
        "Location Error",
        err.message || "Could not fetch current location.",
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const searchLocation = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearchLoading(true);
    try {
      const res = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.location",
          },
          body: JSON.stringify({ textQuery: trimmedQuery }),
        },
      );

      const { places } = await res.json();
      setSearchResults(
        places?.slice(0, 5).map((p: any) => ({
          name: p.displayName.text,
          address: p.formattedAddress,
          latitude: p.location.latitude,
          longitude: p.location.longitude,
        })) || [],
      );
    } catch {
      Alert.alert("Search Error", "Could not reach Google Places API.");
    } finally {
      setSearchLoading(false);
    }
  };

  const onLocationSearchChange = useCallback((text: string) => {
    setLocationSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.length < 3) return setSearchResults([]);

    debounceTimer.current = setTimeout(() => searchLocation(text), 600);
  }, []);

  return {
    location,
    locationSearch,
    searchResults,
    searchLoading,
    gpsLoading,
    useCurrentLocation,
    searchLocation,
    onLocationSearchChange,
    selectLocation: (loc: LocationData) => {
      setLocation(loc);
      resetSearch();
    },
    clearLocation: () => setLocation(null),
  };
}
