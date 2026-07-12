import { PostLocation } from "@/lib/posts";
import { Region } from "react-native-maps";

// Photo-card pin size, also used to anchor its bottom on the point.
export const CARD_W = 62;
export const CARD_H = 72;

// Posts whose on-screen points are within this many pixels get clustered.
export const CLUSTER_PX = 56;

export type Size = { width: number; height: number };

export type Cluster = {
  id: string;
  x: number;
  y: number;
  members: PostLocation[];
};

// Turn a lat/long into an x/y on the map view, using the visible region and the
// map's pixel size. Returns null if don't know the size yet or it's well off
// screen. Linear projection — accurate enough at city zoom, no rotation/tilt.
export function project(
  loc: { latitude: number; longitude: number },
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

// Group the visible posts into clusters based on how close they are on screen.
// Recomputed every region change, so clusters split apart as zoom in.
export function buildClusters(
  locations: PostLocation[],
  region: Region,
  size: Size,
): Cluster[] {
  const pts = locations
    .map((loc) => ({ loc, p: project(loc, region, size) }))
    .filter(
      (e): e is { loc: PostLocation; p: { x: number; y: number } } => !!e.p,
    );

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
