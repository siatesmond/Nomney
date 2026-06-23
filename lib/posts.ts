import { supabase } from "./supabase";
import { timeAgo } from "./utils/timeAgo";

export async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
        id, 
        title,
        caption, 
        created_at,
        profiles!user_id (
            id,
            username,
            avatar_url
        ), 
        post_categories!id (
            categories (
                name
            )
        )  ,
        post_image (
            image_url
        ),
        likes (count),
        comments (count), 
        saves (count)
        `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(mapPost);
}

function mapPost(post) {
  return {
    id: post.id,
    userId: post.profiles?.id,
    username: post.profiles?.username,
    avatarUrl: post.profiles?.avatar_url,
    title: post.title,
    caption: post.caption,
    imageUrls: Array.isArray(post.post_image)
      ? post.post_image.map((img) => img.image_url).filter(Boolean)
      : [],
    categories: (() => {
      const pc = post.post_categories;
      if (!pc) return [];
      const arr = Array.isArray(pc) ? pc : [pc];
      return arr
        .filter(Boolean)
        .map((p) => p.categories?.name)
        .filter(Boolean);
    })(),
    likes: post.likes?.[0]?.count ?? 0,
    comments: post.comments?.[0]?.count ?? 0,
    saves: post.saves?.[0]?.count ?? 0,
    timeAgo: timeAgo(post.created_at),
  };
}