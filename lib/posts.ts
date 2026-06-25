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

export async function getPostDetail(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
        id,
        title,
        caption,
        location_name,
        overall_rating,
        rating_food,
        rating_service,
        rating_environment,
        rating_cleanliness,
        created_at,
        post_image ( image_url, display_order ),
        profiles:profiles!posts_user_id_fkey ( id, username, avatar_url ),
        likes ( user_id, profiles:profiles ( username, avatar_url ) ),
        saves ( user_id ),
        comments ( id, content, created_at, profiles:profiles ( username, avatar_url ) ),
        post_categories ( categories ( name, type ) )
        `,
    )
    .eq("id", postId)
    .single();

  if (error) throw error;

  if (data?.comments) {
    data.comments.sort(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  return data;
}