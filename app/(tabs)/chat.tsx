import { getChatsByUserId, getUserById } from "@/utils/getRoutes";
import { ChatData, UserProfile } from "@/utils/models";
import React, { useContext, useEffect, useState } from "react";
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
  const [userChat, setUserChat] = useState<ChatData[]>([{
    id: 0,
    created_at: new Date(),
    updated_at: new Date(),
    tutor_id: "",
    student_id: "",
  }]);
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const result = await getUserById(user.id);
        const chatResult = await getChatsByUserId(user.id);
        setUserData(result);
        // setUserChat(chatResult);
      }
    };

    fetchData();
  }, [user]);

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
        {userChat.map((chat, index) =>
            <ChatCard key={index} chat={chat}/>
        )}
      </ScrollView>
    </SafeAreaView>
  )
};

export default Chat;
