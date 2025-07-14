import { getUserById } from "@/utils/getRoutes";
import {
  Notification,
  OnlineUser,
  RealtimeContextType,
  UserProfile,
} from "@/utils/models";
import { createTimeTable, updateLastSeen } from "@/utils/postRoutes";
import { supabase } from "@/utils/supabase";
import toastConfig from "@/utils/toastConfig";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, AppState, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import SubjectContextProvider from "./contexts/subjectContext";
import "./global.css";
import themeColors from "./themeColors";

export const AuthContext = createContext<{
  authUser: User | null;
  user: UserProfile | null;
  setAuthUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  verificationPending: boolean;
  setVerificationPending: (value: boolean) => void;
}>({
  authUser: null,
  user: null,
  setAuthUser: () => {},
  setUser: () => {},
  verificationPending: false,
  setVerificationPending: () => {},
});

export const RealtimeContext = createContext<RealtimeContextType>({
  isOnline: false,
  onlineUsers: {},
  globalChatChannel: null,
});

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permissions not granted!!!");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas.projectId,
  });

  console.log("Push token:", tokenData.data);
  console.log("App context:", __DEV__ ? "Development" : "Production");

  return tokenData.data;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function createNotificationChannels() {
  await Notifications.setNotificationChannelAsync("messages", {
    name: "Messages",
    importance: Notifications.AndroidImportance.HIGH,
  });

  await Notifications.setNotificationChannelAsync("reviews", {
    name: "Reviews",
    importance: Notifications.AndroidImportance.HIGH,
  });

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

createNotificationChannels();

export default function RootLayout() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: OnlineUser }>(
    {}
  );
  const [globalChatChannel, setGlobalChatChannel] =
    useState<RealtimeChannel | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const isVerifyingUserRef = useRef(false);

  // Load fonts
  const [fontLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const cleanupPresence = useCallback(async () => {
    if (channelRef.current && user?.id) {
      try {
        await channelRef.current.untrack();
      } catch (err) {
        console.error("Error untracking presence:", err);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoadingUser(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && isMountedRef.current) {
          setAuthUser(session.user);
          const userProfile = await getUserById(session.user.id);
          setUser(userProfile);
        } else {
          setAuthUser(null);
          setUser(null);
          setOnlineUsers({});
        }
        setLoadingUser(false);
      } catch (error) {
        console.error("Error getting session:", error);
        if (isMountedRef.current) {
          setAuthUser(null);
          setUser(null);
          setOnlineUsers({});
          setLoadingUser(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;
      console.log("verifying user:" + isVerifyingUserRef.current);
      if (isVerifyingUserRef.current) return;

      console.log("Auth state change event:", event, session?.user?.id);

      try {
        await cleanupPresence();

        if (session?.user) {
          setLoadingUser(true);
          setAuthUser(session.user);
          const userProfileData = await getUserById(session.user.id);
          console.log("Fetched new user profile:", userProfileData?.id);
          setUser(userProfileData);
          setLoadingUser(false);
        } else {
          console.log("No session, setting user to null");
          setAuthUser(null);
          setUser(null);
          setOnlineUsers({});
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        setAuthUser(null);
        setUser(null);
        setOnlineUsers({});
        setLoadingUser(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      try {
        console.log("RECEIVED URL");
        isVerifyingUserRef.current = true;
        const hash = url.split("#")[1];
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token") ?? "";
        const refresh_token = params.get("refresh_token") ?? "";
        const type = params.get("type") ?? "";

        if (type !== "signup") {
          return console.log("Not verfication url");
        }

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw new Error(error.message);
        const userData = data.user;

        if (!userData) {
          throw new Error("Failed to set session from url params");
        }

        const role = userData?.user_metadata?.role;

        const { error: userError } = await supabase
          .from("users")
          .insert([{ id: userData?.id, role, email: userData?.email }]);

        if (userError) {
          throw new Error("Error creating user profile:" + userError.message);
        }

        if (role === "tutor") {
          const { error: tutorError } = await supabase
            .from("tutors")
            .insert([{ id: userData?.id }]);
          if (tutorError)
            throw new Error("Error creating tutor profile:" + tutorError);
          await createTimeTable(userData?.id ?? "");
        } else {
          const { error: studentError } = await supabase
            .from("students")
            .insert([{ id: userData?.id }]);
          if (studentError)
            throw new Error("Error creating student profile:" + studentError);
        }
        const user = await getUserById(userData.id);
        setUser(user);
        setAuthUser(userData);
        router.push("/(tabs)/(profile)");
        isVerifyingUserRef.current = false;
      } catch (error) {
        console.log(error);
        isVerifyingUserRef.current = false;
      }
    };

    const listener = Linking.addEventListener("url", handleDeepLink);

    // Handle app opened from closed state
    const handleFromAppOpen = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleDeepLink({ url: initialUrl });
      }
    };
    handleFromAppOpen();

    return () => {
      listener.remove();
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
      if (globalChatChannel) {
        globalChatChannel.unsubscribe();
        console.log("Unsubscribed from global chat channel");
      }
    };
  }, [user?.id, cleanupPresence]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // For Push Notifications
  useEffect(() => {
    async function setupNotifications() {
      if (!authUser?.id) return;

      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      const { error } = await supabase.from("push_tokens").upsert(
        {
          user_id: authUser.id,
          token,
          device_name: Device.modelName || "Unknown Device",
          is_active: true,
        },
        {
          onConflict: "user_id,token",
        }
      );

      if (error) {
        console.error("Failed to upsert push token:", error);
      } else {
        console.log("Push token saved!");
      }
    }

    setupNotifications();
  }, [authUser?.id]);

  // Handle notifications listener
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async response => {
        const notif = response.notification.request.content
          .data as Notification;
        if (notif.type === "message") {
          const data = notif.data;
          try {
            const otherUser = await getUserById(data.senderId);
            router.push({
              // @ts-ignore
              pathname: `/chat/${data.chatId}`,
              params: {
                otherUser: JSON.stringify(otherUser),
              },
            });
          } catch (error) {
            console.error("Failed to fetch otherUser data:", error);
            router.push("/(tabs)/chat");
          }
        } else if (notif.type === "review") {
          router.push("/(tabs)/(profile)");
        }
      }
    );

    return () => subscription.remove();
  }, []);

  if (!fontLoaded || loadingUser)
    return (
      <View className='flex-1 bg-neutral-100 justify-center items-center'>
        <ActivityIndicator size='large' color={themeColors["primary-700"]} />
      </View>
    );

  return (
    <>
      <StatusBar
        backgroundColor={themeColors["neutral-100"]}
        barStyle={"dark-content"}
      />
      <SubjectContextProvider>
        <AuthContext.Provider
          value={{
            authUser,
            user,
            setAuthUser,
            setUser,
            verificationPending,
            setVerificationPending,
          }}
        >
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
              </Stack>
            </SafeAreaProvider>
          </RealtimeContext.Provider>
        </AuthContext.Provider>
      </SubjectContextProvider>
      <Toast config={toastConfig} visibilityTime={2500} />
    </>
  );
}
