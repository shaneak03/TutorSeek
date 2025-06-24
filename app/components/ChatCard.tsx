import { ChatWithParticipants } from "@/utils/models";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import UserIcon from "./UserIcon";

interface ChatCardProps {
  chat: ChatWithParticipants;
  currentUserId: string;
}

export default function ChatCard({ chat, currentUserId }: ChatCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: `/chat/${chat.id}`,
      params: {
        otherUser: JSON.stringify({
          id: otherUser.id,
          first_name: otherUser.first_name,
          last_name: otherUser.last_name,
          profile_icon_url: otherUser.profile_icon_url,
          role: isCurrentUserTutor ? "student" : "tutor",
          last_online_at: otherUser.last_online_at,
        }),
      },
    });
  };

  const isCurrentUserTutor = chat.tutor_id === currentUserId;
  const otherUser = isCurrentUserTutor ? chat.student : chat.tutor;
  const unreadCount = chat.unread_count || 0;

  // Format the time from last message or chat update
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Show time if within 24 hours
      return date.toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else if (diffInHours < 168) {
      // 7 days
      // Show day of week if within a week
      return date.toLocaleDateString("en-SG", { weekday: "short" });
    } else {
      // Show date if older than a week
      return date.toLocaleDateString("en-SG", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Get display time
  const displayTime = chat.last_message?.created_at
    ? formatTime(chat.last_message.created_at)
    : formatTime(chat.updated_at);

  const displayMessage = chat.last_message?.content || "No messages yet";

  const displayName = `${otherUser.first_name} ${otherUser.last_name}`;

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      className='px-4 py-3 flex-row items-center gap-3 border-b-hairline border-neutral-300 active:bg-gray-50'
      activeOpacity={0.8}
    >
      <View className='relative'>
        <UserIcon avatarUrl={otherUser.profile_icon_url} size={64} />
      </View>
      <View className='flex-1 flex-row justify-between items-center'>
        <View className='flex-1 pr-2'>
          <View className='flex-row justify-between items-center mb-1'>
            <CustomText className='font-poppins-bold text-lg'>
              {displayName}
            </CustomText>
            <CustomText className='font-poppins-regular text-sm text-gray-500'>
              {displayTime}
            </CustomText>
          </View>
          <View className='flex-row justify-between items-center'>
            <CustomText
              className='font-poppins-regular text-base text-gray-600 flex-1'
              numberOfLines={1}
            >
              {displayMessage}
            </CustomText>
            {unreadCount > 0 ? (
              <View className='bg-primary-700 rounded-full min-w-6 h-6 px-2 justify-center items-center ml-2'>
                <CustomText className='font-poppins-semibold text-xs text-white'>
                  {unreadCount > 99 ? "99+" : unreadCount.toString()}
                </CustomText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
