import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

// First, check if extra exists
const extra = Constants.expoConfig && Constants.expoConfig.extra ? Constants.expoConfig.extra : {};

// Then get the variables or default to empty string
const supabaseUrl = typeof extra.supabaseUrl === "string" ? extra.supabaseUrl : "";
const supabaseAnonKey = typeof extra.supabaseAnonKey === "string" ? extra.supabaseAnonKey : "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
  },
});

export const PUSH_FUNCTION_URL = "https://<your-project>.functions.supabase.co/sendPushNotification";
