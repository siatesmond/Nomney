import { supabase } from '@/lib/supabase';

export async function getStreakData(userId: string): Promise<{ current: number; longest: number }> {
    const { data, error } = await supabase
        .rpc('get_live_streak_data', { target_user_id: userId })
        .single();

    if (error) {
        console.error('Error fetching streak:', error.message);
        return { current: 0, longest: 0 };
    }

    return { current: data?.current_streak ?? 0, longest: data?.longest_streak ?? 0 };
}   