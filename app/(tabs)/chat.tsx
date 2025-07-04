import ChatCard from "@/app/components/ChatCard";
import CustomText from "@/app/components/CustomText";
import LoginModal from "@/app/components/LoginModal";
import { getChatsByUserId, getUserById } from "@/utils/getRoutes";
import { ChatWithParticipants, UserProfile } from "@/utils/models";
import { useFocusEffect } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext, RealtimeContext } from "../_layout";

const Chat = () => {
  const { authUser, user } = useContext(AuthContext);
  const { onlineUsers, globalChatChannel } = useContext(RealtimeContext)
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

  const fetchData = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      const [userResult, chatResult] = await Promise.all([
        getUserById(authUser.id),
        getChatsByUserId(authUser.id),
      ]);
      
      if (userResult) {setUserData(userResult);}
      setUserChat(chatResult);
      console.log("User Data:", userResult);
      console.log("User Chat:", chatResult);
    } catch (err) {
      console.error("Error fetching chat data:", err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(); 
    }, [fetchData])
  );

  useEffect(() => {
    if (!globalChatChannel || !user?.id) return;
    
    console.log("Setting up realtime listeners...");
    console.log("Channel state:", globalChatChannel.state);
    
    globalChatChannel
      .on("broadcast", { event: "new_message" }, (payload) => {
        console.log("Received new_message broadcast:", payload);
        const message = payload.payload;
        
        if (message && message.sender_id !== user.id) {
          console.log("Refreshing chat data...");
          fetchData();
        }
      })
      .on("broadcast", { event: "messages_read" }, (payload) => {
        console.log("Received messages_read broadcast:", payload);
        fetchData();
      });
    
  }, [globalChatChannel, user?.id, fetchData]);

  if (!authUser) return <LoginModal />;

  if (!user) {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-neutral-100">
      <CustomText>Loading your profile...</CustomText>
    </SafeAreaView>
  );
}
  
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
            userChat.map(chat => {
              const isCurrentUserTutor = chat.tutor_id === user.id;
              const otherUser = isCurrentUserTutor ? chat.student : chat.tutor;
              const isOtherUserOnline = Boolean(onlineUsers?.[otherUser.id]);

              return (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  currentUserId={user.id}
                  isOnline={isOtherUserOnline} 
                />
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
};

export default Chat;