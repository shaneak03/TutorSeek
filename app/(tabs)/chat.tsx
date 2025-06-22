import ChatCard from "@/app/components/ChatCard";
import CustomText from "@/app/components/CustomText";
import LoginModal from "@/app/components/LoginModal";
import { getChatsByUserId, getUserById } from "@/utils/getRoutes";
import { ChatWithParticipants, UserProfile } from "@/utils/models";
import { supabase } from "@/utils/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState<UserProfile>({
    id: "",
    first_name: "",
    last_name: "",
    location: "",
    role: "student",
    email: "",
    profile_icon_url: "",
  });
  const [userChat, setUserChat] = useState<ChatWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [userResult, chatResult] = await Promise.all([
        getUserById(user.id),
        getChatsByUserId(user.id),
      ]);

      setUserData(userResult);
      setUserChat(chatResult);
      console.log("User Data:", userResult);
      console.log("User Chat:", chatResult);
    } catch (err) {
      console.error("Error fetching chat data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user?.id) return;

    // Clean up existing
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("chat-global")
      .on("broadcast", { event: "new_message" }, payload => {
        const message = payload.payload;
        if (message.sender_id !== user.id) {
          console.log("Received new message broadcast:", message);
          fetchData();
        }
      })
      .on("broadcast", { event: "messages_read" }, async payload => {
        console.log("Received read broadcast:", payload);
        await fetchData();
      })
      .subscribe(status => {
        console.log("Chat list realtime status:", status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, fetchData]);

  if (!user) return <LoginModal />;
  else
    return (
      <SafeAreaView className=' bg-neutral-100'>
        <View className='p-4 border-neutral-300 border-b-hairline'>
          <CustomText className='font-poppins-bold text-3xl mt-1'>
            <CustomText className='font-poppins-bold text-3xl text-primary-700'>
              {userData.role === "tutor" ? "Student" : "Tutor"}{" "}
            </CustomText>
            Chats
          </CustomText>
        </View>
        <ScrollView
          className='h-full'
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading && userChat.length === 0 ? (
            <View className='p-4'>
              <CustomText>Loading chats...</CustomText>
            </View>
          ) : userChat.length === 0 ? (
            <View className='p-4'>
              <CustomText className='text-neutral-500'>
                {userData.role === "tutor"
                  ? "No chats yet"
                  : " No chats yet. Start a conversation with a tutor"}
              </CustomText>
            </View>
          ) : (
            userChat.map(chat => (
              <ChatCard key={chat.id} chat={chat} currentUserId={user.id} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
};

export default Chat;
