import * as Location from "expo-location";

const countryCache = new Map<string, string | null>();

export async function countryForCoord(
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
