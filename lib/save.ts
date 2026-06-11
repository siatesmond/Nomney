import { supabase } from "./supabase";

// Save post
export async function savePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("saves")
    .insert({ post_id: postId, user_id: userId });

  if (error) throw error;
}

// Unsave post
export async function unsavePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("saves")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (error) throw error;
}
