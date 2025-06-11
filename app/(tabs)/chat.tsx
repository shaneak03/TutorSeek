import { getChatsByUserId, getUserById } from "@/utils/getRoutes";
import { ChatWithParticipants, UserProfile } from "@/utils/models";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";
import ChatCard from "../components/ChatCard";
import CustomText from "../components/CustomText";
import LoginModal from "../components/LoginModal";

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

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const [userResult, chatResult] = await Promise.all([
        getUserById(user.id),
        getChatsByUserId(user.id)
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


  if (!user) return <LoginModal />;

  else return (
    <SafeAreaView className=' bg-neutral-100'>
      <View className='p-8 border-neutral-300 border-b-hairline'>
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
          <View className="p-4">
            <CustomText>Loading chats...</CustomText>
          </View>
        ) : userChat.length === 0 ? (
          <View className="p-4">
            <CustomText className="text-neutral-500 text-center">
              No chats yet. Start a conversation with a {userData.role === "tutor" ? "student" : "tutor"}!
            </CustomText>
          </View>
        ) : (
          userChat.map((chat) => (
            <ChatCard key={chat.id} chat={chat} currentUserId={user.id} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
};

export default Chat;
