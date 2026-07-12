// Shared types used across the app. Keep app-wide shapes here, not inline in files.

// One thumbnail in a profile grid.
export type ImageGridItem = {
    id: string;
    imageUrl: string;
};

// A user profile (the bits we actually use).
export type Profile = {
    id: string;
    full_name: string | null;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
};

// The four ratings on a post (null means not rated).
export type PostRatings = {
    food: number | null;
    service: number | null;
    environment: number | null;
    cleanliness: number | null;
};

// A post as shown in feeds/lists. Built by mapPost() in lib/posts.ts.
export type Post = {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string | null;
    title: string;
    caption: string;
    imageUrls: string[];
    categories: string[];
    location?: string;
    latitude?: number | null;
    longitude?: number | null;
    likes: number;
    comments: number;
    saves: number;
    timeAgo: string;
    ratings: PostRatings;
};

// A comment as shown in the UI. Built by mapComment() in lib/comments.ts.
export type Comment = {
    id: string;
    content: string;
    username: string | null;
    avatar: string | null;
    timeAgo: string;
};

// A user shown in a followers / following list.
export type FollowUser = {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
};

// A tag/category.
export type Category = {
    id: string;
    name: string;
    usage_count?: number;
};
