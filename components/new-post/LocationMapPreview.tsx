// Small map showing one pinned spot. You can't move or zoom it.
import { StyleProp, ViewStyle } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { LocationData } from "@/constants/new-post";

/** Zoom level for the static location preview. */
const MAP_DELTA = 0.005;

/** A non-interactive map showing a single pinned location. */
export function LocationMapPreview({
  location,
  className,
  style,
}: {
  location: Pick<LocationData, "latitude" | "longitude">;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const coordinate = {
    latitude: location.latitude,
    longitude: location.longitude,
  };
  return (
    <MapView
      className={className}
      style={style}
      scrollEnabled={false}
      zoomEnabled={false}
      region={{
        ...coordinate,
        latitudeDelta: MAP_DELTA,
        longitudeDelta: MAP_DELTA,
      }}
    >
      <Marker coordinate={coordinate} />
    </MapView>
  );
}
