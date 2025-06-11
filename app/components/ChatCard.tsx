import { ChatData } from '@/utils/models';
import React from 'react';
import { Image, View } from 'react-native';
import CustomText from './CustomText';

export default function ChatCard({ chat }: { chat: ChatData }) {
  return (
    <View className='px-4 py-3 flex-row items-center gap-3 border-b border-gray-100'>
      {/* Profile Picture */}
      <View className='relative'>
        <Image
          source={require("../../assets/images/profile_icon.jpg")}
          style={{ width: 72, height: 72, borderRadius: 36 }}
        />
      </View>

      {/* Chat Content */}
      <View className='flex-1 flex-row justify-between items-center'>
        <View className='flex-1 pr-2'>
          {/* Name and Time Row */}
          <View className='flex-row justify-between items-center mb-3'>
            <CustomText className='font-poppins-bold text-lg'>
              James J.
            </CustomText>
            <CustomText className='font-poppins-regular text-sm text-gray-500'>
              03:45pm
            </CustomText>
          </View>
          
          {/* Message Preview */}
          <View className='flex-row justify-between items-center'>
            <CustomText 
              className='font-poppins-regular text-base text-gray-600 flex-1'
              numberOfLines={1}
            >
              Last Messages...
            </CustomText>
            
            {/* Unread Badge */}
            <View className='bg-primary-700 rounded-full min-w-6 h-6 px-2 justify-center items-center ml-2'>
              <CustomText className='font-poppins-semibold text-xs text-white'>
                99+
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};