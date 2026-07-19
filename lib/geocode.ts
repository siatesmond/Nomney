// Reverse-geocode a coordinate to a country name.
//
// We use BigDataCloud's free client-side reverse-geocode endpoint (no API key)
// instead of expo-location's reverseGeocodeAsync, because the native Android
// geocoder is unreliable — it drops requests and often returns no country at
// all (e.g. for posts in Japan), which left country chips missing.
//
// Only successful lookups are cached; failures are not, so a transient network
// hiccup doesn't hide a country for the rest of the session.
const countryCache = new Map<string, string>();

export async function countryForCoord(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = countryCache.get(key);
  if (cached) return cached;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      );
      if (res.ok) {
        const data = await res.json();
        const country: string | null =
          data?.countryName || data?.countryCode || null;
        if (country) {
          countryCache.set(key, country);
          return country;
        }
      }
    } catch {
      // ignore and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return null;
}
