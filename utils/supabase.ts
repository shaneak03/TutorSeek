import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

// First, check if extra exists
const extra =
  Constants.expoConfig && Constants.expoConfig.extra
    ? Constants.expoConfig.extra
    : {};

// Then get the variables or default to empty string
const supabaseUrl =
  typeof extra.supabaseUrl === "string" ? extra.supabaseUrl : "";
const supabaseAnonKey =
  typeof extra.supabaseAnonKey === "string" ? extra.supabaseAnonKey : "";

const storage =
  Platform.OS === "web"
    ? undefined
    : require("@react-native-async-storage/async-storage").default;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
  },
});

export const PUSH_FUNCTION_URL =
  "https://zukkncfcptuqrqzxqkhm.supabase.co/functions/v1/pushNotification";
