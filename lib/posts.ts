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
        latitude,
        longitude,
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
    latitude: post.latitude ?? null,
    longitude: post.longitude ?? null,
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
        latitude,
        longitude,
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

export type PostLocation = {
  id: string;
  title: string;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string; // first photo, used for the map pin
  imageUrls: string[]; // all photos, used for the tapped-card gallery
  username?: string; // who posted it (shown for Following / Everyone)
  avatarUrl?: string; // poster's avatar (shown on the pin for Following / Everyone)
};

// Which posts the Map tab shows.
export type MapScope = "mine" | "following" | "everyone";

function mapPostLocation(p: any): PostLocation {
  const images = Array.isArray(p.post_image) ? p.post_image.slice() : [];
  images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
  const imageUrls = images
    .map((img: any) => img.image_url)
    .filter(Boolean) as string[];
  const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
  return {
    id: p.id,
    title: p.title ?? "Untitled",
    locationName: p.location_name ?? "",
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    imageUrl: imageUrls[0],
    imageUrls,
    username: profile?.username ?? undefined,
    avatarUrl: profile?.avatar_url ?? undefined,
  };
}

// Located posts for the Map tab, scoped to your own, people you follow, or
// everyone. Reading others' posts relies on the posts table's public SELECT
// policy (same one the feed already uses).
export async function getPostLocations(
  scope: MapScope,
  userId: string,
): Promise<PostLocation[]> {
  let query = supabase
    .from("posts")
    .select(
      "id, title, location_name, latitude, longitude, post_image ( image_url, display_order ), profiles:profiles!posts_user_id_fkey ( username, avatar_url )",
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (scope === "mine") {
    query = query.eq("user_id", userId);
  } else if (scope === "following") {
    const { data: follows, error: fErr } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", userId);
    if (fErr) throw fErr;
    const ids = (follows ?? []).map((f: any) => f.following_id);
    if (ids.length === 0) return [];
    query = query.in("user_id", ids).limit(300);
  } else {
    // everyone
    query = query.limit(300);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapPostLocation);
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

// Pulls the storage path out of a public image URL so we can delete the file.
// e.g. ".../object/public/posts/<userId>/<file>.jpeg" -> "<userId>/<file>.jpeg"
function storagePathFromUrl(url: string): string | null {
  const marker = "/object/public/posts/";
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

interface UpdatePostPayload {
  postId: string;
  userId: string;
  title: string;
  caption: string;
  // Current photos in display order: a mix of existing URLs (start with http)
  // and newly picked local files (need uploading).
  images: string[];
  // The photo URLs the post had before this edit, so we can spot removed ones.
  originalImageUrls: string[];
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

// Updates a post the current user owns: its fields, photos and tags.
// (Who is allowed to update is enforced by RLS on the server.)
export async function updatePost(payload: UpdatePostPayload) {
  const {
    postId,
    userId,
    images,
    originalImageUrls,
    selectedCategoryIds,
    location,
    ratings,
  } = payload;

  try {
    // 1. Update the main post row.
    const { error: postError } = await supabase
      .from("posts")
      .update({
        title: payload.title || null,
        caption: payload.caption || null,
        location_name: location?.name || null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        rating_food: ratings.food,
        rating_service: ratings.service,
        rating_environment: ratings.environment,
        rating_cleanliness: ratings.cleanliness,
        overall_rating: ratings.overall,
      })
      .eq("id", postId);
    if (postError) throw postError;

    // 2. Photos. Keep existing URLs as-is, upload any new local files, and
    //    build the final ordered list.
    const finalUrls: string[] = [];
    for (const uri of images) {
      if (uri.startsWith("http")) {
        finalUrls.push(uri);
      } else {
        const { publicUrl } = await uploadImageToStorage(uri, userId);
        finalUrls.push(publicUrl);
      }
    }

    // Delete storage files for photos the user removed.
    const removed = originalImageUrls.filter((u) => !finalUrls.includes(u));
    const removedPaths = removed
      .map(storagePathFromUrl)
      .filter((p): p is string => !!p);
    if (removedPaths.length > 0) {
      await supabase.storage.from("posts").remove(removedPaths);
    }

    // Rewrite the post_image rows so order matches what the user sees.
    await supabase.from("post_image").delete().eq("post_id", postId);
    if (finalUrls.length > 0) {
      const { error: imgError } = await supabase.from("post_image").insert(
        finalUrls.map((url, index) => ({
          post_id: postId,
          image_url: url,
          display_order: index,
        })),
      );
      if (imgError) throw imgError;
    }

    // 3. Tags/categories: clear and re-add the current selection.
    await supabase.from("post_categories").delete().eq("post_id", postId);
    if (selectedCategoryIds.length > 0) {
      const { error: catError } = await supabase.from("post_categories").insert(
        selectedCategoryIds.map((catId) => ({
          post_id: postId,
          category_id: catId,
        })),
      );
      if (catError) throw catError;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating post:", error.message);
    return { success: false, error: error.message };
  }
}

// Deletes a post the current user owns, plus its photos from storage.
// The post's likes/saves/comments/images/categories rows are removed by the
// database via ON DELETE CASCADE (see the SQL in the docs), and RLS makes sure
// only the owner can delete.
export async function deletePost(postId: string) {
  // Grab the image URLs first so we can clean up storage after the row is gone.
  const { data: imgs } = await supabase
    .from("post_image")
    .select("image_url")
    .eq("post_id", postId);

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;

  const paths = (imgs || [])
    .map((r) => storagePathFromUrl(r.image_url))
    .filter((p): p is string => !!p);
  if (paths.length > 0) {
    await supabase.storage.from("posts").remove(paths);
  }
}