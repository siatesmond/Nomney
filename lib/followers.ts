import { FollowUser } from "@/constants/types";
import { createJoinTable } from "./joinTable";
import { supabase } from "./supabase";

const followers = createJoinTable("followers", "follower_id", "following_id");

export const followUser = (followerId: string, followingId: string) =>
    followers.add(followerId, followingId);

export const unfollowUser = (followerId: string, followingId: string) =>
    followers.remove(followerId, followingId);

// Supabase may type a joined relation as an array; grab the single row.
function joinedProfile(row: any, key: string): FollowUser | null {
    const p = Array.isArray(row[key]) ? row[key][0] : row[key];
    if (!p?.id) return null;
    return {
        id: p.id,
        username: p.username ?? null,
        full_name: p.full_name ?? null,
        avatar_url: p.avatar_url ?? null,
    };
}

// People who follow `userId`.
export async function getFollowers(userId: string): Promise<FollowUser[]> {
    const { data, error } = await supabase
        .from("followers")
        .select(
            "follower:profiles!followers_follower_id_fkey ( id, username, full_name, avatar_url )",
        )
        .eq("following_id", userId);
    if (error) throw error;
    return (data ?? [])
        .map((r) => joinedProfile(r, "follower"))
        .filter((u): u is FollowUser => !!u);
}

// How many people `userId` follows. Lightweight head+count query (no rows fetched).
export async function getFollowingCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);
    if (error) throw error;
    return count ?? 0;
}

// People `userId` follows.
export async function getFollowing(userId: string): Promise<FollowUser[]> {
    const { data, error } = await supabase
        .from("followers")
        .select(
            "following:profiles!followers_following_id_fkey ( id, username, full_name, avatar_url )",
        )
        .eq("follower_id", userId);
    if (error) throw error;
    return (data ?? [])
        .map((r) => joinedProfile(r, "following"))
        .filter((u): u is FollowUser => !!u);
}