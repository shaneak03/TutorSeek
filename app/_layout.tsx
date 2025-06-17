import { getUserById } from "@/utils/getRoutes";
import { OnlineUser, RealtimeContextType, UserProfile } from "@/utils/models";
import { updateLastSeen } from "@/utils/postRoutes";
import { supabase } from "@/utils/supabase";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState, StatusBar } from "react-native";
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
          if (channelRef.current) {
            await channelRef.current.untrack();
          }
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

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (!user?.id || !channelRef.current) return;

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        try {
          await channelRef.current.send({
            type: 'broadcast',
            event: 'user_leaving',
            payload: { user_id: user.id, timestamp: new Date().toISOString() }
          });
          
          setTimeout(async () => {
            try {
              await channelRef.current.untrack();
              console.log('Untracked presence due to app going to background');
            } catch (error) {
              console.error('Error untracking presence:', error);
            }
          }, 100);
        } catch (error) {
          console.error('Error sending leave broadcast:', error);
        }
      } else if (nextAppState === 'active') {
        try {
          await channelRef.current.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
          console.log('Retracked presence due to app coming to foreground');
        } catch (error) {
          console.error('Error retracking presence:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !isMountedRef.current) return;

    if (channelRef.current) {
      channelRef.current.untrack().catch(console.error);
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
        Object.entries(state).forEach(([key, presences]) => {
          const presence = (presences as any[])[0];
          if (presence?.user_id) {
            newOnlineUsers[key] = {
              user_id: presence.user_id,
              online_at: presence.online_at || new Date().toISOString()
            };
          }
        });
        
        setOnlineUsers(prevUsers => {
          const prevKeys = Object.keys(prevUsers);
          const newKeys = Object.keys(newOnlineUsers);
          
          const leftUsers = prevKeys.filter(key => !newKeys.includes(key));
          
          leftUsers.forEach(async (key) => {
            try {
              const userId = prevUsers[key]?.user_id || key;
              const { error } = await supabase
                .from('users')
                .update({ last_online_at: new Date().toISOString() })
                .eq('id', userId);
              
              if (error) throw error;
              console.log(`Updated last_online_at for user ${userId} (detected via sync)`);
            } catch (err) {
              console.error("Failed to update last_online_at via sync:", err);
            }
          });
          
          return newOnlineUsers;
        });
        
        console.log("Online users:", Object.keys(newOnlineUsers));
      })
      .on("presence", { event: "join" }, async ({ key, newPresences }) => {
        if (!isMountedRef.current) return;
        
        console.log("User joined:", key, newPresences);

        await updateLastSeen(key)
        
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
      .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
        if (!isMountedRef.current) return;
        console.log("User leaving presence with key:", key, "leftPresences:", leftPresences);

        let userId = key;
        if (leftPresences && leftPresences.length > 0) {
          const leftPresence = leftPresences[0] as any;
          if (leftPresence.user_id) {
            userId = leftPresence.user_id;
          }
        }

        await updateLastSeen(userId)

        setOnlineUsers(prev => {
          const newState = { ...prev };
          delete newState[key];
          console.log(`Removed user ${key} from online users`);
          return newState;
        });
      })
      .on("broadcast", { event: "user_leaving" }, async ({ payload }) => {
        if (!isMountedRef.current) return;
        console.log("Received user leaving broadcast:", payload);
        
        if (payload.user_id) {
          try {
            const { error } = await supabase
              .from('users')
              .update({ last_online_at: payload.timestamp || new Date().toISOString() })
              .eq('id', payload.user_id);
            
            if (error) throw error;
            console.log(`Updated last_online_at for user ${payload.user_id} via broadcast`);
          } catch (err) {
            console.error("Failed to update last_online_at via broadcast:", err);
          }

          setOnlineUsers(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(key => {
              if (newState[key].user_id === payload.user_id) {
                delete newState[key];
                console.log(`Removed user ${payload.user_id} from online users via broadcast`);
              }
            });
            return newState;
          });
        }
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
      const cleanup = async () => {
        if (channelRef.current && user?.id) {
          try {
            await channelRef.current.send({
              type: 'broadcast',
              event: 'user_leaving',
              payload: { user_id: user.id, timestamp: new Date().toISOString() }
            });
            setTimeout(async () => {
              try {
                await channelRef.current.untrack();
                console.log("Untracked presence before cleanup");
              } catch (error) {
                console.error("Error untracking during cleanup:", error);
              }
              
              channelRef.current.unsubscribe();
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
              console.log("Unsubscribed from global presence channel");
            }, 100);
          } catch (error) {
            console.error("Error sending leave broadcast during cleanup:", error);
            try {
              await channelRef.current.untrack();
            } catch (e) {
              console.error("Error untracking during fallback cleanup:", e);
            }
            channelRef.current.unsubscribe();
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
          }
        }
      };
      
      cleanup();
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