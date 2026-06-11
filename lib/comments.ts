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

  return {
    id: data.id,
    content: data.content,
    username: data.profiles?.username,
    avatar: data.profiles?.avatar_url,
    timeAgo: timeAgo(data.created_at),
  };
}
