import { supabase } from "./supabase";
import { timeAgo } from "./utils/timeAgo";

// Get comments acc to post id
export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
        id,
        content,
        created_at, 
        profiles (
            username, 
            avatar_url
        )
    `,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((comment) => ({
    id: comment.id,
    content: comment.content,
    username: comment.profiles?.username,
    avatar: comment.profiles?.avatar_url,
    timeAgo: timeAgo(comment.created_at),
  }));
}
