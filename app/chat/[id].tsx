import { AuthContext, RealtimeContext } from '@/app/_layout';
import CustomText from '@/app/components/CustomText';
import MessageBubble from '@/app/components/MessageBubble';
import { getChatMessagesByChatIdAndPages } from '@/utils/getRoutes';
import { ChatMessageWithSender, UserProfile } from '@/utils/models';
import { markMessagesAsRead, postChatMessage } from '@/utils/postRoutes';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = () => {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useContext(RealtimeContext);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatId = Number(params.id);
  const otherUser = JSON.parse(params.otherUser as string);
  const isOtherUserOnline = Boolean(onlineUsers[otherUser.id]);
  
  const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isComponentMountedRef = useRef(true);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 120) return `${Math.floor(diffMins / 60)} hour ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    if (diffMins < 2880) return `${Math.floor(diffMins / 1440)} day ago`
    return `${Math.floor(diffMins / 1440)} days ago`;
  };
  
  const PAGE_SIZE = 50;

  // Memoize static values to prevent unnecessary re-renders
  const staticChatId = useMemo(() => chatId, []); // eslint-disable-line react-hooks/exhaustive-deps
  const staticOtherUser = useMemo(() => otherUser, []); // eslint-disable-line react-hooks/exhaustive-deps
  const staticUserId = useMemo(() => user?.id, [user?.id]);

  // Transform message to include sender info 
  const transformMessage = useCallback((msg: any): ChatMessageWithSender => ({
    ...msg,
    sender: {
      id: msg.sender_id,
      first_name: msg.sender_id === staticUserId ? 'You' : staticOtherUser.first_name,
      last_name: msg.sender_id === staticUserId ? '' : staticOtherUser.last_name,
      profile_icon_url: msg.sender_id === staticUserId ? '' : staticOtherUser.profile_icon_url,
      role: msg.sender_id === staticUserId ? (user as UserProfile).role : staticOtherUser.role,
    }
  }), [staticUserId, staticOtherUser, user]);

  const markChatAsRead = useCallback(async () => {
    if (!staticUserId) return;
    try {
      await markMessagesAsRead(staticChatId, staticUserId);
      
      // Broadcast read status to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'messages_read',
          payload: {
            chat_id: staticChatId,
            user_id: staticUserId,
            read_at: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [staticChatId, staticUserId]);

  const setupChatChannel = useCallback(() => {
    if (!staticUserId || !isComponentMountedRef.current) return;

    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(`chat-messages-${staticChatId}`)
      .on('broadcast', { event: 'new_message' }, (payload) => {
        if (!isComponentMountedRef.current) return;
        
        const newMessage = payload.payload;
        if (newMessage.chat_id === staticChatId && newMessage.sender_id !== staticUserId) {
          const messageWithSender = transformMessage(newMessage);
          
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            return exists ? prev : [...prev, messageWithSender];
          });
          
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          markChatAsRead();
        }
      })
      .on('broadcast', { event: 'messages_read' }, (payload) => {
        if (!isComponentMountedRef.current) return;
        
        const { chat_id, user_id } = payload.payload;
        if (chat_id === staticChatId && user_id !== staticUserId) {
          setMessages(prev => 
            prev.map(msg => 
              msg.sender_id === staticUserId ? { ...msg, read: true } : msg
            )
          );
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [staticChatId, staticUserId, transformMessage, markChatAsRead]);


  // Fetch messages with pagination
  const fetchMessages = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const fetchedMessages = await getChatMessagesByChatIdAndPages(staticChatId, page, PAGE_SIZE);
      
      const messagesWithSender: ChatMessageWithSender[] = fetchedMessages
        .map(transformMessage)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      if (append) {
        setMessages(prev => [...messagesWithSender, ...prev]);
      } else {
        setMessages(messagesWithSender);
        setIsInitialLoad(false);
      }

      setHasMoreMessages(fetchedMessages.length === PAGE_SIZE);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [staticChatId, transformMessage]);

  // Load more messages (older messages)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || loadingMore) return;
    
    const nextPage = currentPage + 1;
    await fetchMessages(nextPage, true);
    setCurrentPage(nextPage);
  }, [hasMoreMessages, loadingMore, currentPage, fetchMessages]);

  // Refresh messages (pull to refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreMessages(true);
    await fetchMessages(1, false);
  }, [fetchMessages]);

  // Handle scroll to detect when to load more messages
  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    
    if (contentOffset.y <= 50 && hasMoreMessages && !loadingMore && !isInitialLoad) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, loadingMore, isInitialLoad, loadMoreMessages]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !user || sending) return;

    const messageContent = messageText.trim();
    let optimisticMessage: ChatMessageWithSender | null = null;

    try {
      setSending(true);
      
      const currentUserProfile = user as UserProfile;
      const senderRole = currentUserProfile.role;
      const tutorId = senderRole === 'tutor' ? user.id : staticOtherUser.id;
      const studentId = senderRole === 'student' ? user.id : staticOtherUser.id;

      optimisticMessage = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        sender_id: user.id,
        recipient_id: staticOtherUser.id,
        content: messageContent,
        chat_id: staticChatId,
        read: false,
        sender: {
          id: user.id,
          first_name: 'You',
          last_name: '',
          profile_icon_url: '',
          role: senderRole
        }
      };

      setMessages(prev => [...prev, optimisticMessage!]);
      setMessageText('');

      const { message: newMessage } = await postChatMessage(
        {
          sender_id: user.id,
          recipient_id: staticOtherUser.id,
          content: messageContent
        },
        senderRole,
        tutorId,
        studentId
      );

      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage!.id 
            ? {
                ...newMessage,
                sender: optimisticMessage!.sender
              } 
            : msg
        )
      );

      // Broadcast new message to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMessage
        });
      }
      
      setTimeout(() => {
        if (scrollViewRef.current && isComponentMountedRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      
      if (optimisticMessage) {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage!.id));
      }
      
      setMessageText(messageContent);
    } finally {
      setSending(false);
    }
  }, [messageText, user, sending, staticOtherUser.id, staticChatId]);

  // Initialization
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    const initialize = async () => {
      await fetchMessages();
      await markChatAsRead();
      setupChatChannel();
    };
    
    initialize();

    return () => {
      isComponentMountedRef.current = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchMessages, markChatAsRead, setupChatChannel]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      setTimeout(() => {
        if (scrollViewRef.current && isComponentMountedRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [messages.length, isInitialLoad]);

  const displayName = `${staticOtherUser.first_name} ${staticOtherUser.last_name.charAt(0)}.`;

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-100 justify-center items-center">
        <CustomText className="text-gray-500">Loading...</CustomText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="bg-neutral-100 border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20}/>
          </TouchableOpacity>
          <Image
            source={
              staticOtherUser.profile_icon_url
                ? { uri: staticOtherUser.profile_icon_url }
                : require("@/assets/images/profile_icon.jpg")
            }
            className="w-16 h-16 rounded-full"
          />
          <View className="flex-1">
            <CustomText className="font-poppins-semibold text-xl text-gray-900">
              {displayName}
            </CustomText>
            <CustomText className="font-poppins-regular text-sm text-gray-500">
              {isOtherUserOnline
                ? 'Online'
                : `Last seen ${formatRelativeTime(staticOtherUser.last_online_at)}`}
              {loadingMore && 'Loading...'}
            </CustomText>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-neutral-200 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
        >
          {loadingMore && (
            <View className="py-4 items-center">
              <CustomText className="text-gray-500 text-sm">Loading older messages...</CustomText>
            </View>
          )}
          
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <CustomText className="text-gray-500">Loading messages...</CustomText>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <CustomText className="text-gray-500 text-center">
                No messages yet. Start the conversation!
              </CustomText>
            </View>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.sender_id === user.id;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                />
              );
            })
          )}
        </ScrollView>
        <View className="bg-neutral-100 border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-neutral-200 rounded-full px-4 py-2 min-h-[44px] max-h-24">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message"
                placeholderTextColor="gray-400"
                multiline
                maxLength={1000}
                className="font-poppins-regular text-base text-gray-900 max-h-24"
                style={{ textAlignVertical: 'center' }}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                submitBehavior='blurAndSubmit'
                editable={!sending}
              />
            </View>
            <TouchableOpacity 
              onPress={handleSend}
              disabled={!messageText.trim() || sending}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                messageText.trim() && !sending 
                  ? 'bg-primary-700' 
                  : 'bg-gray-300'
              }`}
              activeOpacity={0.7}
            >
              {sending ? (
                <View className="w-5 h-5 border-2 border-neutral-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Ionicons name="send" size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;