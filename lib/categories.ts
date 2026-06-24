import { supabase } from "./supabase";

// Resolves tag names into category IDs, creating any that don't exist yet.
// `customTypes` maps a tag name to the type to use when creating it (defaults
// to "food_type").
export async function resolveTagsToCategoryIds(
    tags: string[],
    customTypes: Record<string, "food_type" | "meal_type"> = {},
): Promise<string[]> {
    if (!tags.length) return [];

    const { data: existing, error } = await supabase
        .from("categories")
        .select("id, name")
        .in("name", tags);

    if (error) throw error;

    const existingNames = existing?.map((c) => c.name) || [];
    const resolvedIds = existing?.map((c) => c.id) || [];
    const missingTags = tags.filter((tag) => !existingNames.includes(tag));

    if (missingTags.length > 0) {
        const { data: inserted, error: insertError } = await supabase
            .from("categories")
            .insert(
                missingTags.map((name) => ({
                    name,
                    type: customTypes[name] ?? "food_type",
                    usage_count: 1,
                })),
            )
            .select("id");

        if (insertError) throw insertError;
        if (inserted) resolvedIds.push(...inserted.map((c) => c.id));
    }

    return resolvedIds;
}

// Bumps usage_count for the given categories (popularity tracking).
export async function incrementCategoryUsage(
    categoryIds: string[],
): Promise<void> {
    if (categoryIds.length === 0) return;
    const { error } = await supabase.rpc("increment_category_usage", {
        category_ids: categoryIds,
    });
    if (error) throw error;
}