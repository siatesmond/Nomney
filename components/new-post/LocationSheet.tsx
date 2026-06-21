import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { RefObject } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { LocationData } from "../../constants/new-post";

interface LocationSheetProps {
  sheetRef: RefObject<BottomSheet>;
  location: LocationData | null;
  locationSearch: string;
  searchResults: LocationData[];
  searchLoading: boolean;
  gpsLoading: boolean;
  onLocationSearchChange: (text: string) => void;
  searchLocation: (query: string) => void;
  useCurrentLocation: () => void;
  selectLocation: (loc: LocationData) => void;
}

export default function LocationSheet({
  sheetRef,
  location,
  locationSearch,
  searchResults,
  searchLoading,
  gpsLoading,
  onLocationSearchChange,
  searchLocation,
  useCurrentLocation,
  selectLocation,
}: LocationSheetProps) {
  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={["75%"]}
      enablePanDownToClose
    >
      <View className="flex-1">
        <BottomSheetScrollView
          contentContainerClassName="px-5 py-2 gap-3"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-base font-semibold text-neutral-900 text-center">
            Add Location
          </Text>

          {/* Search Input Block */}
          <View className="flex-row gap-2 items-center">
            <View className="flex-1 flex-row items-center border border-neutral-200 rounded-lg bg-white h-12 pl-3 pr-2">
              <TextInput
                className="flex-1 text-sm text-neutral-900 pr-2"
                style={{
                  height: "100%",
                  paddingTop: 0,
                  paddingBottom: 0,
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
                placeholder="Search a place or restaurant..."
                placeholderTextColor="#999"
                value={locationSearch}
                onChangeText={onLocationSearchChange}
                returnKeyType="search"
                onSubmitEditing={() => searchLocation(locationSearch)}
              />

              {/* Conditional Clear Button (The Cross) */}
              {locationSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => onLocationSearchChange("")}
                  className="p-1"
                >
                  <Ionicons name="close-circle" size={18} color="#A3A3A3" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              className="bg-[#F4522A] rounded-lg h-12 px-4 items-center justify-center"
              onPress={() => searchLocation(locationSearch)}
            >
              {searchLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="search" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* GPS Trigger */}
          <TouchableOpacity
            className="flex-row items-center gap-2 h-12 px-3 border border-[#F4522A] rounded-lg"
            onPress={useCurrentLocation}
          >
            {gpsLoading ? (
              <ActivityIndicator color="#F4522A" size="small" />
            ) : (
              <Ionicons name="navigate" size={16} color="#F4522A" />
            )}
            <Text className="text-sm text-[#F4522A] font-medium">
              Use my current location
            </Text>
          </TouchableOpacity>

          {/* Search Results */}
          {searchResults.map((item, i) => (
            <TouchableOpacity
              key={`${item.latitude}-${item.longitude}-${i}`}
              className="flex-row items-start gap-3 py-3 border-b border-neutral-100"
              onPress={() => selectLocation(item)}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color="#F4522A"
                className="mt-0.5"
              />
              <View className="flex-1">
                <Text
                  className="text-sm font-medium text-neutral-900"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.address && (
                  <Text
                    className="text-xs text-neutral-400 mt-0.5"
                    numberOfLines={1}
                  >
                    {item.address}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Selected Map Preview */}
          {location && searchResults.length === 0 && (
            <View className="gap-1 mt-2">
              <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Selected Location
              </Text>
              <Text className="text-sm font-semibold text-neutral-900">
                {location.name}
              </Text>
              {location.address && (
                <Text className="text-xs text-neutral-400 mb-1">
                  {location.address}
                </Text>
              )}

              <MapView
                style={{ height: 200, width: "100%" }}
                className="rounded-xl mt-1"
                scrollEnabled={false}
                zoomEnabled={false}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                />
              </MapView>
            </View>
          )}
        </BottomSheetScrollView>

        {/* Footer Action */}
        <View className="p-5 border-t border-neutral-200 bg-white">
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${!location ? "bg-neutral-200" : "bg-[#F4522A]"}`}
            onPress={() => location && sheetRef.current?.close()}
            disabled={!location}
          >
            <Text
              className={`text-base font-semibold ${!location ? "text-neutral-400" : "text-white"}`}
            >
              {location ? "Confirm Location" : "Select a Location"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}
