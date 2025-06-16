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
      if (!isMountedRef.current) return;

      try {
        if (session?.user) {
          const userProfile = await getUserById(session.user.id);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
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
        
        const newOnlineUsers: { [key: string]: OnlineUser } = {};
        Object.values(state).forEach((presences) => {
          const presence = (presences as any[])[0];
          if (presence?.user_id) {
            newOnlineUsers[presence.user_id] = {
              user_id: presence.user_id,
              online_at: presence.online_at || new Date().toISOString()
            };
          }
        });
        
        setOnlineUsers(newOnlineUsers);
        console.log("Online users:", Object.keys(newOnlineUsers));
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
      .on("presence", { event: "leave" }, async ({ key }) => {
        if (!isMountedRef.current) return;

        try {
          const { error } = await supabase
            .from('users')
            .update({ last_online_at: new Date().toISOString() })
            .eq('id', key);
          
          if (error) throw error;
        } catch (err) {
          console.error("Failed to update last_online_at:", err);
        }

        // Then update local state
        setOnlineUsers(prev => {
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