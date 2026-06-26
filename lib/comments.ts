import { Comment } from "@/constants/types";
import { supabase } from "./supabase";
import { timeAgo } from "./utils/timeAgo";

function mapComment(row: any): Comment {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    content: row.content,
    username: profile?.username ?? null,
    avatar: profile?.avatar_url ?? null,
    timeAgo: timeAgo(row.created_at),
  };
}

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

  return data.map(mapComment);
}

// Add a comment to post
export async function addComment(
  postId: string,
  userId: string,
  content: string,
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: userId,
      content,
    })
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
    .single(); // return new comment

  if (error) throw error;

  return mapComment(data);
}
