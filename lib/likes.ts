import { supabase } from "./supabase";

// Like post
export async function likePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("likes")
    .insert({ post_id: postId, user_id: userId });

  if (error) throw error;
}

// Unlike post
export async function unlikePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (error) throw error;
}
