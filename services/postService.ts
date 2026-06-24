import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import { readAsStringAsync } from "expo-file-system/legacy";

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

export async function createNewPost(payload: SubmitPostPayload) {
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