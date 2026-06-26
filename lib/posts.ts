import { Post } from "@/constants/types";
import { decode } from "base64-arraybuffer";
import { readAsStringAsync } from "expo-file-system/legacy";
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
        location_name,
        likes (count),
        comments (count), 
        saves (count),
        rating_food,
        rating_service,
        rating_environment,
        rating_cleanliness
        `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(mapPost);
}

function mapPost(post: any): Post {
  return {
    id: post.id,
    userId: post.profiles?.id,
    username: post.profiles?.username,
    avatarUrl: post.profiles?.avatar_url,
    title: post.title,
    caption: post.caption,
    imageUrls: Array.isArray(post.post_image)
      ? post.post_image.map((img: any) => img.image_url).filter(Boolean)
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
    location: post.location_name ?? undefined,
    likes: post.likes?.[0]?.count ?? 0,
    comments: post.comments?.[0]?.count ?? 0,
    saves: post.saves?.[0]?.count ?? 0,
    timeAgo: timeAgo(post.created_at),
    ratings: {
      food: post.rating_food ?? null,
      service: post.rating_service ?? null,
      environment: post.rating_environment ?? null,
      cleanliness: post.rating_cleanliness ?? null,
    },
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

interface SubmitPostPayload {
  userId: string;
  title: string;
  caption: string;
  images: string[];
  selectedCategoryIds: string[];
  location: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
  ratings: {
    food: number;
    service: number;
    environment: number;
    cleanliness: number;
    overall: number;
  };
}

// Uploads one image to storage and returns its public URL + storage path.
// The path is kept so we can delete it again if the post fails to save.
async function uploadImageToStorage(
  localUri: string,
  userId: string,
): Promise<{ publicUrl: string; filePath: string }> {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpeg`;
  const filePath = `${userId}/${fileName}`;

  const base64Data = await readAsStringAsync(localUri, {
    encoding: "base64",
  });
  const arrayBuffer = decode(base64Data);

  const { error } = await supabase.storage
    .from("posts")
    .upload(filePath, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("posts")
    .getPublicUrl(filePath);

  return { publicUrl: publicUrlData.publicUrl, filePath };
}

// Creates a post: upload images, insert the post row, then its images and tags.
// If any step fails, we undo what was already done (see the catch block).
export async function createNewPost(payload: SubmitPostPayload) {
  // Track what we've created so we can clean up if something later fails.
  const uploadedPaths: string[] = [];
  let createdPostId: string | null = null;

  try {
    const imageUrls: string[] = [];
    for (const imageUri of payload.images) {
      const { publicUrl, filePath } = await uploadImageToStorage(
        imageUri,
        payload.userId,
      );
      uploadedPaths.push(filePath);
      imageUrls.push(publicUrl);
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: payload.userId,
        title: payload.title || null,
        caption: payload.caption || null,
        location_name: payload.location?.name || null,
        latitude: payload.location?.latitude || null,
        longitude: payload.location?.longitude || null,
        rating_food: payload.ratings.food,
        rating_service: payload.ratings.service,
        rating_environment: payload.ratings.environment,
        rating_cleanliness: payload.ratings.cleanliness,
        overall_rating: payload.ratings.overall,
      })
      .select("id")
      .single();

    if (postError) throw postError;
    createdPostId = postData.id;

    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((url, index) => ({
        post_id: createdPostId,
        image_url: url,
        display_order: index,
      }));

      const { error: imgError } = await supabase
        .from("post_image")
        .insert(imageRows);

      if (imgError) throw imgError;
    }

    if (payload.selectedCategoryIds.length > 0) {
      const categoryRows = payload.selectedCategoryIds.map((catId) => ({
        post_id: createdPostId,
        category_id: catId,
      }));

      const { error: catError } = await supabase
        .from("post_categories")
        .insert(categoryRows);

      if (catError) throw catError;
    }

    return { success: true, postId: createdPostId };
  } catch (error: any) {
    console.error(
      "Error executing backend post creation workflow:",
      error.message,
    );

    // Roll back: delete the half-made post and any images we already uploaded,
    // so we don't leave junk behind.
    try {
      if (createdPostId) {
        await supabase.from("posts").delete().eq("id", createdPostId);
      }
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("posts").remove(uploadedPaths);
      }
    } catch (cleanupError: any) {
      console.error("Cleanup after failed post creation also failed:", cleanupError.message);
    }

    return { success: false, error: error.message };
  }
}