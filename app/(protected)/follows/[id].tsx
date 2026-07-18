// Followers / Following list. Toggle between the two, search with Fuse, and
// tap anyone to open their profile.
import { Avatar } from "@/components/UserAvatar";
import { FollowUser } from "@/constants/types";
import { COLORS } from "@/constants/theme";
import { getFollowers, getFollowing } from "@/lib/followers";
import { resolveAvatarUrl } from "@/lib/profile";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tab = "followers" | "following";

export default function FollowsScreen() {
  const router = useRouter();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();

  const [active, setActive] = useState<Tab>(
    tab === "following" ? "following" : "followers",
  );
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const [f1, f2] = await Promise.all([getFollowers(id), getFollowing(id)]);
        if (cancelled) return;
        setFollowers(f1);
        setFollowing(f2);
      } catch (err) {
        console.log("Failed to load connections:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const list = active === "followers" ? followers : following;

  const fuse = useMemo(
    () => new Fuse(list, { keys: ["username", "full_name"], threshold: 0.3 }),
    [list],
  );
  const results = search.trim()
    ? fuse.search(search.trim()).map((r) => r.item)
    : list;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "followers", label: "Followers", count: followers.length },
    { key: "following", label: "Following", count: following.length },
  ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FDFCF9]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.ink} />
        </TouchableOpacity>
        <Text className="ml-2 text-lg font-bold" style={{ color: COLORS.ink }}>
          Connections
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-2">
        {tabs.map(({ key, label, count }) => {
          const isActive = active === key;
          return (
            <TouchableOpacity
              key={key}
              className="flex-1 items-center pb-2"
              style={{
                borderBottomWidth: 2,
                borderColor: isActive ? COLORS.accent : COLORS.line,
              }}
              onPress={() => setActive(key)}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: isActive ? COLORS.accent : COLORS.muted }}
              >
                {label} {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <View className="mx-4 my-2 flex-row items-center bg-[#F2F2F2] rounded-full px-3 h-10">
        <Ionicons name="search" size={16} color={COLORS.muted} />
        <TextInput
          className="flex-1 ml-2 text-sm"
          placeholder={`Search ${active}`}
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          style={{ color: COLORS.ink }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(u) => u.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: 4 }}
          ListEmptyComponent={
            <View className="items-center pt-16 px-8">
              <Text
                className="text-sm text-center"
                style={{ color: COLORS.muted }}
              >
                {search.trim()
                  ? "No one matches that search."
                  : active === "followers"
                    ? "No followers yet."
                    : "Not following anyone yet."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const name = item.full_name || item.username || "User";
            return (
              <TouchableOpacity
                className="flex-row items-center px-5 py-3"
                activeOpacity={0.7}
                onPress={() => router.push(`/user/${item.id}`)}
              >
                <Avatar
                  avatarUrl={resolveAvatarUrl(item.avatar_url)}
                  displayName={name}
                  size="sm"
                  shadow={false}
                />
                <View className="ml-3 flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: COLORS.ink }}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  {item.username && (
                    <Text
                      className="text-xs"
                      style={{ color: COLORS.muted }}
                      numberOfLines={1}
                    >
                      @{item.username}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
