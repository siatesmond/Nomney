import { supabase } from "./supabase";

/**
 * Factory for simple two-column join tables (e.g. `likes`, `saves`,
 * `followers`). Centralizes the insert / delete / lookup pattern that was
 * previously copy-pasted across several modules.
 */
export function createJoinTable(table: string, colA: string, colB: string) {
  return {
    /** Insert the (a, b) relationship row. */
    async add(a: string, b: string): Promise<void> {
      const row: Record<string, string> = { [colA]: a, [colB]: b };
      // Cast required: the untyped client can't infer a dynamic table's columns.
      const { error } = await supabase.from(table).insert(row as any);
      if (error) throw error;
    },

    /** Delete the (a, b) relationship row. */
    async remove(a: string, b: string): Promise<void> {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(colA, a)
        .eq(colB, b);
      if (error) throw error;
    },

    /** Return every `selectCol` value where `whereCol` equals `value`. */
    async listColumn(
      selectCol: string,
      whereCol: string,
      value: string,
    ): Promise<string[]> {
      const { data, error } = await supabase
        .from(table)
        .select(selectCol)
        .eq(whereCol, value);
      if (error) throw error;
      return (data ?? []).map((row: any) => row[selectCol]);
    },
  };
}
