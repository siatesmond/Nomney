import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageGrid } from "./ImageGrid";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};
type UserProfileProps = {
  userId: string;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  postImages?: string[];
  savedImages?: string[];
  isLoadingPosts?: boolean;
};

const ACCENT = "#F4522A";

export function UserProfile({
  userId,
  isOwnProfile,
  onEdit = () => {},
  onFollow,
  postImages = [],
  savedImages = [],
  isLoadingPosts = false,
}: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Posts" | "Saved">("Posts");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);
        const { data, error: err } = await supabase
          .from("profiles")
          .select("id, full_name, username, first_name, last_name, avatar_url")
          .eq("id", userId)
          .single();

        if (err) throw err;
        setProfile(data);

        if (data?.avatar_url) {
          setAvatarUrl(
            data.avatar_url.startsWith("http")
              ? data.avatar_url
              : supabase.storage.from("avatars").getPublicUrl(data.avatar_url)
                  .data.publicUrl,
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [userId]);

  if (loadingProfile || isLoadingPosts) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error || "Profile not found"}</Text>
      </SafeAreaView>
    );
  }

  const displayName =
    profile.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Anonymous";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader
          avatarUrl={avatarUrl}
          displayName={displayName}
          username={profile.username}
          isOwnProfile={isOwnProfile}
          onEditPress={onEdit}
          onFollowPress={() => {
            setIsFollowing(!isFollowing);
            onFollow?.();
          }}
          isFollowing={isFollowing}
        />
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <ImageGrid images={activeTab === "Posts" ? postImages : savedImages} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9F9F9" },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40, flexGrow: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  errorText: { color: "#999", fontSize: 14 },
});
