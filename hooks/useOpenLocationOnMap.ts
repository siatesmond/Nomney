import { useRouter } from "expo-router";

// Returns a function that jumps to the Map tab and focuses a location.
// The map reads focusLat/focusLng/focusName from the query and flies there.
export function useOpenLocationOnMap() {
  const router = useRouter();
  return (loc: { latitude: number; longitude: number; name?: string }) => {
    router.push({
      pathname: "/map",
      params: {
        focusLat: String(loc.latitude),
        focusLng: String(loc.longitude),
        focusName: loc.name ?? "",
        focusTs: String(Date.now()), // unique each tap so re-tapping re-focuses
      },
    });
  };
}
