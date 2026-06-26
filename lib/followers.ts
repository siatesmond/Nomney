import { createJoinTable } from "./joinTable";

const followers = createJoinTable("followers", "follower_id", "following_id");

export const followUser = (followerId: string, followingId: string) =>
    followers.add(followerId, followingId);

export const unfollowUser = (followerId: string, followingId: string) =>
    followers.remove(followerId, followingId);