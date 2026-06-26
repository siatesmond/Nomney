import BottomSheet from "@gorhom/bottom-sheet";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

import LocationSheet from "@/components/new-post/LocationSheet";
import NewPostForm from "@/components/new-post/NewPostForm";
import RatingsSheet from "@/components/new-post/RatingsSheet";
import TagsSheet from "@/components/new-post/TagsSheet";

import { DEFAULT_RATINGS, RatingKey } from "@/constants/new-post";
import { COLORS } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useNewPostImages } from "@/hooks/useNewPostImages";
import { useNewPostLocation } from "@/hooks/useNewPostLocation";
import { incrementCategoryUsage, resolveTagsToCategoryIds } from "@/lib/categories";
import { createNewPost } from "@/lib/posts";
import { supabase } from "@/lib/supabase";

// New post screen. Holds all the form state and saves the post when you tap Post.
export default function NewPostScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [customTagTypes, setCustomTagTypes] = useState<Record<string, "food_type" | "meal_type">>({});

  const [ratings, setRatings] =
    useState<Record<RatingKey, number>>(DEFAULT_RATINGS);

  const { foodTypes, mealTypes } = useCategories();
  const { images, showOptions, removeImage } = useNewPostImages();
  const { location, ...locationProps } = useNewPostLocation();

  const tagsSheetRef = useRef<BottomSheet>(null!);
  const ratingsSheetRef = useRef<BottomSheet>(null!);
  const locationSheetRef = useRef<BottomSheet>(null!);

  const activeRatings = Object.values(ratings).filter((v) => v > 0);
  const hasRating = activeRatings.length > 0;
  const overallRating = hasRating
    ? (
      activeRatings.reduce((sum, val) => sum + val, 0) / activeRatings.length
    ).toFixed(1)
    : "0";

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const addCustomTagWithType = (
    formattedTag: string,
    type: "food_type" | "meal_type",
  ) => {
    if (!selectedTags.includes(formattedTag)) {
      setSelectedTags((prev) => [...prev, formattedTag]);
      setCustomTagTypes((prev) => ({ ...prev, [formattedTag]: type }));
    }
  };

  const submitPost = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error("Authentication session active expired.");

      const resolvedCategoryIds = await resolveTagsToCategoryIds(
        selectedTags,
        customTagTypes,
      );

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

      await incrementCategoryUsage(resolvedCategoryIds);

      Alert.alert("Post Created!!!", "Your memory has been created!!!!", [
        { text: "Awesome", onPress: () => router.replace("/home") },
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

  const handlePostSubmission = () => {
    // Required
    if (!images.length) {
      return Alert.alert(
        "Missing Photos",
        "Please select or snap at least one photo for your post.",
      );
    }

    // Optional-but-nudged
    const missing: string[] = [];
    if (!title.trim()) missing.push("a title");
    if (!hasRating) missing.push("a rating (it will be saved as 0)");
    if (!selectedTags.length) missing.push("a category or tag");
    if (!location) missing.push("a location");

    if (missing.length > 0) {
      const list =
        missing.length === 1
          ? missing[0]
          : missing.slice(0, -1).join(", ") +
          " and " +
          missing[missing.length - 1];

      return Alert.alert(
        "Almost there!!",
        `You haven't added ${list}. Post anyway?`,
        [
          { text: "Go back", style: "cancel" },
          { text: "Post anyway", onPress: submitPost },
        ],
      );
    }

    submitPost();
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
          <ActivityIndicator size="large" color={COLORS.accent} />
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