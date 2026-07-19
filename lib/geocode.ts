import * as Location from "expo-location";

// Only successful lookups are cached. Failures are NOT cached so a transient
// geocoder hiccup doesn't hide a country for the rest of the session.
const countryCache = new Map<string, string>();

export async function countryForCoord(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = countryCache.get(key);
  if (cached) return cached;

  // The Android geocoder can transiently return "Service not Available" or an
  // empty result (especially under load), so retry a few times before giving up.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      // country can be null even when isoCountryCode is present — fall back to it.
      const country = place?.country ?? place?.isoCountryCode ?? null;
      if (country) {
        countryCache.set(key, country);
        return country;
      }
    } catch {
      // ignore and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return null;
}
