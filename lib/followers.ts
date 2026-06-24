import { supabase } from "./supabase";

export async function followUser(followerId: string, followingId: string) {
    const { error } = await supabase
        .from("followers")
        .insert({ follower_id: followerId, following_id: followingId });
    if (error) throw error;
}

export async function unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
        .from("followers")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);
    if (error) throw error;
}