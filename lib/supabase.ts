import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

console.log('=== SUPABASE CONFIG ===')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabasePublishableKey)
console.log('Key length:', supabasePublishableKey?.length)
console.log('=====================')

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})