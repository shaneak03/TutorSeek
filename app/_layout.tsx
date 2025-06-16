import { getUserById } from "@/utils/getRoutes";
import { OnlineUser, RealtimeContextType, UserProfile } from "@/utils/models";
import { supabase } from "@/utils/supabase";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import React, { createContext, useEffect, useRef, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import themeColors from "./themeColors";

export const AuthContext = createContext<any>(null);

export const RealtimeContext = createContext<RealtimeContextType>({ 
  isOnline: false, 
  onlineUsers: {} 
});

export default function RootLayout() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: OnlineUser }>({});
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Load fonts
  useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (session?.user && isMountedRef.current) {
          const userProfile = await getUserById(session.user.id);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      
      } catch (error) {
        console.error('Error getting session:', error);
        if (isMountedRef.current) {
          setUser(null);
        }
      }
    };
    
    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMountedRef.current) {
        // Fetch the full user profile from your database
        const { data: userProfile, error } = await supabase
          .from('users') // Replace 'users' with your actual table name
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        } else {
          setUser(userProfile as UserProfile);
        }
      } else if (isMountedRef.current) {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Setup realtime presence for global online status
  useEffect(() => {
    if (!user?.id || !isMountedRef.current) return;

    // Cleanup existing channel first
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel("presence-global", {
        config: {
          broadcast: { self: false },
          presence: { key: user.id.toString() },
        },
      })
      .on("presence", { event: "sync" }, () => {
        if (!isMountedRef.current) return;
        
        const state = channel.presenceState();
        console.log("Presence sync, full state:", state);
        
        const transformedUsers: { [key: string]: OnlineUser } = {};
        Object.entries(state).forEach(([key, presences]) => {
          if (Array.isArray(presences) && presences.length > 0) {
            const presence = presences[0] as any;
            if (presence.user_id && presence.online_at) {
              transformedUsers[key] = {
                user_id: presence.user_id,
                online_at: presence.online_at
              };
            }
          }
        });
        
        setOnlineUsers(transformedUsers);
        console.log("Online users:", Object.keys(transformedUsers));
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (!isMountedRef.current) return;
        
        console.log("User joined:", key, newPresences);
        
        const presenceArray = Array.isArray(newPresences) ? newPresences : [newPresences];
        const presence = presenceArray[0] as any;
        
        if (presence && presence.user_id && presence.online_at) {
          setOnlineUsers((prev) => ({ 
            ...prev, 
            [key]: {
              user_id: presence.user_id,
              online_at: presence.online_at
            }
          }));
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (!isMountedRef.current) return;
        
        console.log("User left:", key);
        setOnlineUsers((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      })
      .subscribe(async (status) => {
        console.log("Global presence subscription status:", status);
        if (status === "SUBSCRIBED" && isMountedRef.current) {
          try {
            const trackResult = await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            console.log("User tracked in global presence:", user.id, trackResult);
          } catch (err) {
            console.error("Error tracking global presence:", err);
          }
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log("Unsubscribed from global presence channel");
      }
    };
  }, [user?.id]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <>
      <StatusBar
        backgroundColor={themeColors["neutral-100"]}
        barStyle={"dark-content"}
      />
      <AuthContext.Provider value={{ user, setUser }}>
        <RealtimeContext.Provider
          value={{ 
            isOnline: Boolean(Object.keys(onlineUsers).length), 
            onlineUsers 
          }}
        >
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
            </Stack>
          </SafeAreaProvider>
        </RealtimeContext.Provider>
      </AuthContext.Provider>
    </>
  );
}