import { ChatMessageWithSender } from '@/utils/models';
import React from 'react';
import { View } from 'react-native';
import CustomText from './CustomText';

interface MessageBubbleProps {
  message: ChatMessageWithSender;
  isCurrentUser: boolean;
  showTime: boolean;
  showSenderName?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showTime,
  showSenderName = true
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-SG', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <View className="mb-4">
      <View className={`flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <View
          className={`max-w-[280px] px-4 py-3 ${
            isCurrentUser
              ? 'bg-primary-700 rounded-3xl rounded-br-lg'
              : 'bg-neutral-100 rounded-3xl rounded-bl-lg'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          {!isCurrentUser && showSenderName && (
            <CustomText className="font-poppins-semibold text-sm text-gray-900 mb-1">
              {message.sender.first_name} {message.sender.last_name}
            </CustomText>
          )}
          
          <CustomText 
            className={`font-poppins-regular text-base leading-5 ${
              isCurrentUser ? 'text-neutral-100' : 'text-gray-900'
            }`}
          >
            {message.content}
          </CustomText>
        </View>
      </View>
      {showTime && (
        <View className={`flex-row mt-1 px-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <View className="flex-row items-center gap-1">
            <CustomText className="font-poppins-regular text-xs text-gray-400">
              {formatTime(message.created_at)}
            </CustomText>
            {isCurrentUser && message.read && (
              <CustomText className="text-blue-500 text-xs">✓</CustomText>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default MessageBubble;