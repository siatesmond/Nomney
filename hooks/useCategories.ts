import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useCategories() {
  const [categories, setCategories] = useState<{
    foodTypes: string[];
    mealTypes: string[];
  }>({
    foodTypes: [],
    mealTypes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch only fields needed, implicitly ordered by popularity count
        const { data, error } = await supabase
          .from("categories")
          .select("name, type")
          .order("usage_count", { ascending: false });

        if (error) throw error;

        // Perform a single-pass extraction loop instead of dual .filter().map()
        const sorted = (data || []).reduce(
          (acc, item) => {
            if (item.type === "food_type") acc.foodTypes.push(item.name);
            else if (item.type === "meal_type") acc.mealTypes.push(item.name);
            return acc;
          },
          { foodTypes: [], mealTypes: [] } as {
            foodTypes: string[];
            mealTypes: string[];
          },
        );

        setCategories(sorted);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { ...categories, loadingCategories: loading };
}
