/**
 * Application Constants for New Post Flow
 */

// API Keys - ensure these are defined in your .env file
export const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

// Rating Configuration - used for dynamic generation in RatingsSheet
export const RATING_CATEGORIES = [
  { key: "food", label: "Food", icon: "restaurant-outline" },
  { key: "service", label: "Service", icon: "people-outline" },
  { key: "environment", label: "Environment", icon: "leaf-outline" },
  { key: "cleanliness", label: "Cleanliness", icon: "sparkles-outline" },
] as const;

export type RatingKey = (typeof RATING_CATEGORIES)[number]["key"];

// Data Models
export type LocationData = {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
};

// Default state helpers for cleaner initialization in hooks
export const DEFAULT_RATINGS: Record<RatingKey, number> = {
  food: 0,
  service: 0,
  environment: 0,
  cleanliness: 0,
};
