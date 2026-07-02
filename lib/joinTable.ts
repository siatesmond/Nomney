import { supabase } from "./supabase";

export function createJoinTable(table: string, colA: string, colB: string) {
  return {
    async add(a: string, b: string): Promise<void> {
      const row: Record<string, string> = { [colA]: a, [colB]: b };
      const { error } = await supabase
        .from(table)
        .upsert(row as any, { onConflict: `${colA},${colB}`, ignoreDuplicates: true });
      if (error) throw error;
    },

    async remove(a: string, b: string): Promise<void> {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(colA, a)
        .eq(colB, b);
      if (error) throw error;
    },

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
