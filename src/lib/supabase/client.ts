import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { secureStorage } from "@/lib/secureStorage";
import type { Database } from "./types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: secureStorage,
    },
});
