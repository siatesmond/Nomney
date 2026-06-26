import { createJoinTable } from "./joinTable";

const likes = createJoinTable("likes", "post_id", "user_id");

// Like post
export const likePost = (postId: string, userId: string) =>
  likes.add(postId, userId);

// Unlike post
export const unlikePost = (postId: string, userId: string) =>
  likes.remove(postId, userId);

// Get all post ids the current user has already liked
export const getUserLikedPostIds = (userId: string): Promise<string[]> =>
  likes.listColumn("post_id", "user_id", userId);
