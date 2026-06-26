import { createJoinTable } from "./joinTable";

const saves = createJoinTable("saves", "post_id", "user_id");

// Save post
export const savePost = (postId: string, userId: string) =>
  saves.add(postId, userId);

// Unsave post
export const unsavePost = (postId: string, userId: string) =>
  saves.remove(postId, userId);

// Get all post ids the current user has already saved
export const getUserSavedPostIds = (userId: string): Promise<string[]> =>
  saves.listColumn("post_id", "user_id", userId);
