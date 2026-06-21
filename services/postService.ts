import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
// ✅ Fixed: Importing from the official legacy subpath to satisfy Expo SDK 54 rules
import { readAsStringAsync } from "expo-file-system/legacy";

interface SubmitPostPayload {
  userId: string;
  title: string;
  caption: string;
  images: string[]; // Local file URIs from ImagePicker (e.g., 'file://...')
  selectedCategoryIds: string[]; // Array of category UUIDs from your chips selections
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

/**
 * Helper function to upload a single local image URI to Supabase Storage
 * Bypasses broken global fetch blobs by uploading an explicit ArrayBuffer.
 */
async function uploadImageToStorage(
  localUri: string,
  userId: string,
): Promise<string> {
  // 1. Prepare unique path matching folder policy: "userId/timestamp_uuid.jpg"
  const fileExt = localUri.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // 2. Read the local file using a raw string literal via the legacy route
  const base64Data = await readAsStringAsync(localUri, {
    encoding: "base64",
  });

  // 3. Decode base64 into a pure ArrayBuffer binary payload that Supabase digests perfectly
  const arrayBuffer = decode(base64Data);

  // 4. Upload raw ArrayBuffer payload to 'posts' bucket
  const { data, error } = await supabase.storage
    .from("posts")
    .upload(filePath, arrayBuffer, {
      contentType: `image/${fileExt}`,
      upsert: false,
    });

  if (error) throw error;

  // 5. Extract and return the public access URL
  const { data: publicUrlData } = supabase.storage
    .from("posts")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Core handler to save the complete post payload with relational tables
 */
export async function createNewPost(payload: SubmitPostPayload) {
  try {
    // STEP 1: Upload all images first to gather the remote URLs
    const imageUrls: string[] = [];
    for (const imageUri of payload.images) {
      const publicUrl = await uploadImageToStorage(imageUri, payload.userId);
      imageUrls.push(publicUrl);
    }

    // STEP 2: Insert into the main 'posts' table
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
    const postId = postData.id;

    // STEP 3: Batch insert into 'post_image' using the generated post ID
    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((url, index) => ({
        post_id: postId,
        image_url: url,
        display_order: index, // Retains visual sequence of the photo grid
      }));

      const { error: imgError } = await supabase
        .from("post_image")
        .insert(imageRows);

      if (imgError) throw imgError;
    }

    // STEP 4: Batch insert selected categories into 'post_categories' junction table
    if (payload.selectedCategoryIds.length > 0) {
      const categoryRows = payload.selectedCategoryIds.map((catId) => ({
        post_id: postId,
        category_id: catId,
      }));

      const { error: catError } = await supabase
        .from("post_categories")
        .insert(categoryRows);

      if (catError) throw catError;
    }

    return { success: true, postId };
  } catch (error: any) {
    console.error(
      "Error executing backend post creation workflow:",
      error.message,
    );
    return { success: false, error: error.message };
  }
}
