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
import { RealtimeChannel } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SubjectContextProvider from "./contexts/subjectContext";
import "./global.css";
import themeColors from "./themeColors";

export const AuthContext = createContext<{
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}>({ user: null, setUser: () => {} });

export const RealtimeContext = createContext<RealtimeContextType>({
  isOnline: false,
  onlineUsers: {},
  globalChatChannel: null,
});

export default function RootLayout() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: OnlineUser }>(
    {}
  );
  const [globalChatChannel, setGlobalChatChannel] =
    useState<RealtimeChannel | null>(null);
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Load fonts
  useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const cleanupPresence = async () => {
    if (channelRef.current && user?.id) {
      try {
        await channelRef.current.untrack();
      } catch (err) {
        console.error("Error untracking during cleanup:", err);
      }
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      console.log("Cleaned up presence channel");
    }

    if (globalChatChannel) {
      try {
        globalChatChannel.unsubscribe();
        supabase.removeChannel(globalChatChannel);
        setGlobalChatChannel(null);
        console.log("Cleaned up global chat channel");
      } catch (err) {
        console.error("Error cleaning up global chat channel:", err);
      }
    }
  };

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
        console.error("Error getting session:", error);
        if (isMountedRef.current) {
          setUser(null);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      console.log("Auth state change event:", event, session?.user?.id);

      try {
        await cleanupPresence();

        if (session?.user) {
          const userProfile = await getUserById(session.user.id);
          console.log("Fetched new user profile:", userProfile?.id);
          setUser(userProfile);
        } else {
          console.log("No session, setting user to null");
          setUser(null);
          setOnlineUsers({});
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        setUser(null);
        setOnlineUsers({});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (!user?.id || !channelRef.current) return;

      if (nextAppState === "background" || nextAppState === "inactive") {
        try {
          console.log("App going to background, untracking presence");
          await channelRef.current.untrack();
        } catch (error) {
          console.error("Error untracking on background:", error);
        }
      } else if (nextAppState === "active") {
        try {
          console.log("App coming to foreground, tracking presence");
          await channelRef.current.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });

          setTimeout(() => {
            if (channelRef.current) {
              const presenceState = channelRef.current.presenceState();
              const newState: { [id: string]: OnlineUser } = {};
              Object.entries(presenceState).forEach(([key, presences]) => {
                const presence = (presences as any[])[0];
                if (presence?.user_id) {
                  newState[key] = {
                    user_id: presence.user_id,
                    online_at: presence.online_at || new Date().toISOString(),
                  };
                }
              });
              setOnlineUsers(newState);
              console.log(
                "Refreshed online users on app resume:",
                Object.keys(newState)
              );
            }
          }, 100);
        } catch (error) {
          console.error("Error retracking presence:", error);
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !isMountedRef.current) {
      if (!user?.id) {
        cleanupPresence();
        setOnlineUsers({});
      }
      return;
    }

    cleanupPresence();

    const channel = supabase
      .channel("presence-global", {
        config: {
          broadcast: { self: false },
          presence: { key: user.id },
        },
      })
      .on("presence", { event: "sync" }, () => {
        const newState: { [id: string]: OnlineUser } = {};

        const presenceState = channel.presenceState();
        console.log("Current presence state:", presenceState);

        Object.entries(presenceState).forEach(([key, presences]) => {
          const presence = (presences as any[])[0];
          if (presence?.user_id) {
            newState[key] = {
              user_id: presence.user_id,
              online_at: presence.online_at || new Date().toISOString(),
            };
          }
        });

        setOnlineUsers(newState);
        console.log("Online users:", Object.keys(newState));
      })
      .on("presence", { event: "join" }, async ({ key, newPresences }) => {
        if (!isMountedRef.current) return;

        console.log("User joined:", key, newPresences);

        await updateLastSeen(key);

        const presenceArray = Array.isArray(newPresences)
          ? newPresences
          : [newPresences];
        const presence = presenceArray[0] as any;

        if (presence && presence.user_id && presence.online_at) {
          setOnlineUsers(prev => ({
            ...prev,
            [key]: {
              user_id: presence.user_id,
              online_at: presence.online_at,
            },
          }));
        }
      })
      .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
        if (!isMountedRef.current) return;

        console.log("User leaving:", key, leftPresences);

        const leavingUserId = key;

        if (leavingUserId === user.id) {
          console.log("Ignoring leave event for self:", leavingUserId);
          return;
        }

        console.log("Processing leave for user:", leavingUserId);

        try {
          await updateLastSeen(leavingUserId);
        } catch (error) {
          console.error("Failed to update last seen on leave:", error);
        }
        setOnlineUsers(prev => {
          const newState = { ...prev };
          delete newState[leavingUserId];
          console.log(`Removed user ${leavingUserId} from online users`);
          return newState;
        });
      })
      .subscribe(async status => {
        console.log("Global presence subscription status:", status);
        if (status === "SUBSCRIBED" && isMountedRef.current) {
          try {
            const trackResult = await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            console.log(
              "User tracked in global presence:",
              user.id,
              trackResult
            );
          } catch (err) {
            console.error("Error tracking global presence:", err);
          }
        }
      });

    channelRef.current = channel;

    const chatChannel = supabase
      .channel("chat-global", {
        config: {
          broadcast: { self: false },
        },
      })
      .on("broadcast", { event: "new_message" }, payload => {
        console.log("New message received in global channel:", payload);
      })
      .on("broadcast", { event: "messages_read" }, payload => {
        console.log("Messages read event in global channel:", payload);
      })
      .subscribe();

    setGlobalChatChannel(chatChannel);

    return () => {
      cleanupPresence();
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
      <SubjectContextProvider>
        <AuthContext.Provider value={{ user, setUser }}>
          <RealtimeContext.Provider
            value={{
              isOnline: Boolean(Object.keys(onlineUsers).length),
              onlineUsers,
              globalChatChannel,
            }}
          >
            <SafeAreaProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name='(tabs)' />
                <Stack.Screen name='(auth)' />
              </Stack>
            </SafeAreaProvider>
          </RealtimeContext.Provider>
        </AuthContext.Provider>
      </SubjectContextProvider>
    </>
  );
}
