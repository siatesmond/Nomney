// Edit one of your own posts. Reuses the new-post form, pre-filled with the
// post's current title, caption, location, ratings, photos and tags.
import BottomSheet from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

import LocationSheet from "@/components/new-post/LocationSheet";
import NewPostForm from "@/components/new-post/NewPostForm";
import RatingsSheet from "@/components/new-post/RatingsSheet";
import TagsSheet from "@/components/new-post/TagsSheet";

import { DEFAULT_RATINGS, LocationData, RatingKey } from "@/constants/new-post";
import { COLORS } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useCategories } from "@/hooks/useCategories";
import { useNewPostImages } from "@/hooks/useNewPostImages";
import { useNewPostLocation } from "@/hooks/useNewPostLocation";
import { resolveTagsToCategoryIds } from "@/lib/categories";
import { getPostDetail, updatePost } from "@/lib/posts";

type TagType = "food_type" | "meal_type";

// Everything the form needs to start from the existing post.
type InitialData = {
  title: string;
  caption: string;
  ratings: Record<RatingKey, number>;
  location: LocationData | null;
  selectedTags: string[];
  customTagTypes: Record<string, TagType>;
  images: string[];
};

// Supabase sometimes types joined relations as arrays; grab the single value.
const one = <T,>(v: T | T[] | null | undefined): T | undefined =>
  Array.isArray(v) ? v[0] : (v ?? undefined);

function buildInitialData(data: any): InitialData {
  const sortedImages = (data.post_image || [])
    .slice()
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map((img: any) => img.image_url)
    .filter(Boolean);

  const selectedTags: string[] = [];
  const customTagTypes: Record<string, TagType> = {};
  for (const row of data.post_categories || []) {
    const cat = one<any>(row.categories);
    if (cat?.name) {
      selectedTags.push(cat.name);
      if (cat.type) customTagTypes[cat.name] = cat.type;
    }
  }

  const hasCoords = data.latitude != null && data.longitude != null;

  return {
    title: data.title ?? "",
    caption: data.caption ?? "",
    ratings: {
      food: data.rating_food ?? 0,
      service: data.rating_service ?? 0,
      environment: data.rating_environment ?? 0,
      cleanliness: data.rating_cleanliness ?? 0,
    },
    location: hasCoords
      ? {
          name: data.location_name ?? "",
          latitude: data.latitude,
          longitude: data.longitude,
        }
      : null,
    selectedTags,
    customTagTypes,
    images: sortedImages,
  };
}

export default function EditPostScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthContext();

  const [initial, setInitial] = useState<InitialData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getPostDetail(id);
        if (cancelled) return;

        // Only the owner may edit (RLS also enforces this on the server).
        const authorId = one<any>(data?.profiles)?.id;
        if (authorId && profile?.id && authorId !== profile.id) {
          Alert.alert("Not allowed", "You can only edit your own posts.");
          router.back();
          return;
        }

        setInitial(buildInitialData(data));
      } catch (err: any) {
        if (!cancelled) setLoadError(err.message || "Could not load the post.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, profile?.id, router]);

  if (!id) return null;

  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FDFCF9]">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#999] text-sm">{loadError}</Text>
      </View>
    );
  }

  if (!initial) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FDFCF9]">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Mount the form only once the data is ready, so the hooks seed correctly.
  return <EditPostForm postId={id} initial={initial} />;
}

function EditPostForm({
  postId,
  initial,
}: {
  postId: string;
  initial: InitialData;
}) {
  const router = useRouter();
  const { profile } = useAuthContext();

  const [title, setTitle] = useState(initial.title);
  const [caption, setCaption] = useState(initial.caption);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial.selectedTags,
  );
  const [customTagTypes, setCustomTagTypes] = useState<Record<string, TagType>>(
    initial.customTagTypes,
  );
  const [ratings, setRatings] = useState<Record<RatingKey, number>>(
    initial.ratings ?? DEFAULT_RATINGS,
  );

  const { foodTypes, mealTypes } = useCategories();
  const { images, showOptions, removeImage } = useNewPostImages(initial.images);
  const { location, ...locationProps } = useNewPostLocation(initial.location);

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

  const addCustomTagWithType = (formattedTag: string, type: TagType) => {
    if (!selectedTags.includes(formattedTag)) {
      setSelectedTags((prev) => [...prev, formattedTag]);
      setCustomTagTypes((prev) => ({ ...prev, [formattedTag]: type }));
    }
  };

  const saveChanges = async () => {
    if (!profile?.id) {
      return Alert.alert("Not signed in", "Please sign in again.");
    }
    if (!images.length) {
      return Alert.alert("Missing Photos", "A post needs at least one photo.");
    }

    setLoading(true);
    try {
      const resolvedCategoryIds = await resolveTagsToCategoryIds(
        selectedTags,
        customTagTypes,
      );

      const result = await updatePost({
        postId,
        userId: profile.id,
        title: title.trim(),
        caption: caption.trim(),
        images,
        originalImageUrls: initial.images,
        selectedCategoryIds: resolvedCategoryIds,
        location,
        ratings: { ...ratings, overall: Number(overallRating) },
      });

      if (!result.success)
        throw new Error(result.error || "Could not save your changes.");

      Alert.alert("Saved", "Your post has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Save Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDFCF9]">
      <Stack.Screen options={{ headerShown: false }} />

      <NewPostForm
        headerTitle="Edit Post"
        submitLabel="Save"
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
        onPostPress={saveChanges}
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
