import BottomSheet from "@gorhom/bottom-sheet";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

// Components
import LocationSheet from "@/components/new-post/LocationSheet";
import NewPostForm from "@/components/new-post/NewPostForm";
import RatingsSheet from "@/components/new-post/RatingsSheet";
import TagsSheet from "@/components/new-post/TagsSheet";

// Hooks, Libs, & Constants
import { RatingKey } from "@/constants/new-post";
import { useCategories } from "@/hooks/useCategories";
import { useNewPostImages } from "@/hooks/useNewPostImages";
import { useNewPostLocation } from "@/hooks/useNewPostLocation";
import { supabase } from "@/lib/supabase";
import { createNewPost } from "@/services/postService";

export default function NewPostScreen() {
  const router = useRouter();

  // Core Form Input State
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    food: 0,
    service: 0,
    environment: 0,
    cleanliness: 0,
  });

  // Feature Hooks
  const { foodTypes, mealTypes } = useCategories();
  const { images, showOptions, removeImage } = useNewPostImages();
  const { location, ...locationProps } = useNewPostLocation();

  // Bottom Sheet Bottom sheet control references
  const tagsSheetRef = useRef<BottomSheet>(null!);
  const ratingsSheetRef = useRef<BottomSheet>(null!);
  const locationSheetRef = useRef<BottomSheet>(null!);

  // Derived Performance Calculations
  const activeRatings = Object.values(ratings).filter((v) => v > 0);
  const hasRating = activeRatings.length > 0;
  const overallRating = hasRating
    ? (
        activeRatings.reduce((sum, val) => sum + val, 0) / activeRatings.length
      ).toFixed(1)
    : "0";

  // State Management Actions
  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const addCustomTagWithType = (formattedTag: string) => {
    if (!selectedTags.includes(formattedTag)) {
      setSelectedTags((prev) => [...prev, formattedTag]);
    }
  };

  /**
   * Resolves text strings into Supabase category IDs.
   * Creates missing tags seamlessly inline to reduce code overhead.
   */
  const resolveTagsToCategoryIds = async (
    tags: string[],
  ): Promise<string[]> => {
    if (!tags.length) return [];

    // 1. Fetch matching records already present in the database
    const { data: existing, error } = await supabase
      .from("categories")
      .select("id, name")
      .in("name", tags);

    if (error) throw error;

    const existingNames = existing?.map((c) => c.name) || [];
    const resolvedIds = existing?.map((c) => c.id) || [];
    const missingTags = tags.filter((tag) => !existingNames.includes(tag));

    // 2. Safely mint missing tags as fallback entries on-the-fly
    if (missingTags.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("categories")
        .insert(
          missingTags.map((name) => ({
            name,
            type: "food_type",
            usage_count: 1,
          })),
        )
        .select("id");

      if (insertError) throw insertError;
      if (inserted) resolvedIds.push(...inserted.map((c) => c.id));
    }

    return resolvedIds;
  };

  // Main Event Handlers
  const handlePostSubmission = async () => {
    if (!images.length) {
      return Alert.alert(
        "Missing Photos",
        "Please select or snap at least one photo for your post.",
      );
    }

    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error("Authentication session active expired.");

      const resolvedCategoryIds = await resolveTagsToCategoryIds(selectedTags);

      // Submit fully packaged post data directly to the service wrapper
      const result = await createNewPost({
        userId: user.id,
        title: title.trim(),
        caption: caption.trim(),
        images,
        selectedCategoryIds: resolvedCategoryIds,
        location,
        ratings: { ...ratings, overall: Number(overallRating) },
      });

      if (!result.success)
        throw new Error(result.error || "Database transmission failed.");

      // Run transactional data upkeep calculations cleanly
      if (resolvedCategoryIds.length > 0) {
        await supabase.rpc("increment_category_usage", {
          category_ids: resolvedCategoryIds,
        });
      }

      Alert.alert("Success 🎉", "Your culinary memory has been saved!", [
        { text: "Awesome", onPress: () => router.replace("/") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Upload Error",
        error.message || "An unexpected problem occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <NewPostForm
        title={title}
        setTitle={setTitle}
        caption={caption}
        setCaption={setCaption}
        images={images}
        removeImage={removeImage}
        showOptions={showOptions}
        selectedTags={selectedTags}
        onTagsPress={() => tagsSheetRef.current?.expand()}
        hasRating={hasRating}
        overallRating={overallRating}
        onRatingsPress={() => ratingsSheetRef.current?.expand()}
        location={location}
        clearLocation={locationProps.clearLocation}
        onLocationPress={() => locationSheetRef.current?.expand()}
        onPostPress={handlePostSubmission}
      />

      {loading && (
        <View className="absolute inset-0 bg-black/30 justify-center items-center z-[999]">
          <ActivityIndicator size="large" color="#F4522A" />
        </View>
      )}

      <TagsSheet
        sheetRef={tagsSheetRef}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        addCustomTagWithType={addCustomTagWithType}
        foodTypes={foodTypes}
        mealTypes={mealTypes}
      />

      <RatingsSheet
        sheetRef={ratingsSheetRef}
        ratings={ratings}
        hasRating={hasRating}
        overallRating={() => overallRating}
        setRating={(cat, val) =>
          setRatings((prev) => ({ ...prev, [cat]: val }))
        }
      />

      <LocationSheet
        sheetRef={locationSheetRef}
        location={location}
        {...locationProps}
      />
    </View>
  );
}
