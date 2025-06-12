import { AuthContext } from '@/app/_layout';
import CustomText from '@/app/components/CustomText';
import MessageBubble from '@/app/components/MessageBubble';
import { getChatMessagesByChatIdAndPages } from '@/utils/getRoutes';
import { ChatMessageWithSender, UserProfile } from '@/utils/models';
import { markMessagesAsRead, postChatMessage } from '@/utils/postRoutes';
import { supabase } from '@/utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatId = Number(params.id);
  const otherUser = JSON.parse(params.otherUser as string);
  
  const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const PAGE_SIZE = 50; // Adjust based on your needs

  // Transform message to include sender info
  const transformMessage = useCallback((msg: any): ChatMessageWithSender => ({
    ...msg,
    sender: {
      id: msg.sender_id,
      first_name: msg.sender_id === user?.id ? 'You' : otherUser.first_name,
      last_name: msg.sender_id === user?.id ? '' : otherUser.last_name,
      profile_icon_url: msg.sender_id === user?.id ? '' : otherUser.profile_icon_url,
      role: msg.sender_id === user?.id ? (user as UserProfile).role : otherUser.role
    }
  }), [user, otherUser]);

  // Setup Supabase realtime subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (!user?.id) return;
    console.log('chatId:', chatId)
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = transformMessage(payload.new);
          
          if (newMessage.sender_id !== user.id) {
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
            
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = transformMessage(payload.new);
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        if (key === otherUser.id) {
          setIsOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        if (key === otherUser.id) {
          setIsOnline(false);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (!user?.id) {
          console.warn('Tried to track presence but user.id is undefined');
          return;
        }
        if (status === 'SUBSCRIBED') {
          channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;
  }, [chatId, user?.id, otherUser.id, transformMessage]);

  const cleanupRealtimeSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  // Fetch messages with pagination
  const fetchMessages = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const fetchedMessages = await getChatMessagesByChatIdAndPages(chatId, page, PAGE_SIZE);
      
      // Transform messages to include sender info
      const messagesWithSender: ChatMessageWithSender[] = fetchedMessages
        .map(transformMessage)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Ensure chronological order
      
      if (append) {
        // Prepend older messages to the beginning
        setMessages(prev => [...messagesWithSender, ...prev]);
      } else {
        setMessages(messagesWithSender);
        setIsInitialLoad(false);
      }

      // Check if there are more messages
      setHasMoreMessages(fetchedMessages.length === PAGE_SIZE);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [chatId, transformMessage]);

  // Load more messages (older messages)
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMore) return;
    
    const nextPage = currentPage + 1;
    await fetchMessages(nextPage, true);
    setCurrentPage(nextPage);
  };

  // Refresh messages (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreMessages(true);
    await fetchMessages(1, false);
  };

  // Handle scroll to detect when to load more messages
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Check if scrolled to top (load more messages)
    if (contentOffset.y <= 50 && hasMoreMessages && !loadingMore && !isInitialLoad) {
      loadMoreMessages();
    }
  };

  const markChatAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      await markMessagesAsRead(chatId, user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatId, user.id]);

  const handleSend = async () => {
    if (!messageText.trim() || !user || sending) return;

    const messageContent = messageText.trim();
    let optimisticMessage: ChatMessageWithSender | null = null;

    try {
      setSending(true);
      
      const currentUserProfile = user as UserProfile;
      const senderRole = currentUserProfile.role;
      const tutorId = senderRole === 'tutor' ? user.id : otherUser.id;
      const studentId = senderRole === 'student' ? user.id : otherUser.id;

      optimisticMessage = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        sender_id: user.id,
        recipient_id: otherUser.id,
        content: messageContent,
        chat_id: chatId,
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
          recipient_id: otherUser.id,
          content: messageContent
        },
        senderRole,
        tutorId,
        studentId
      );

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
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
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
  };

  useEffect(() => {
    fetchMessages();
    markChatAsRead();
    setupRealtimeSubscription();

    return () => {
      cleanupRealtimeSubscription();
    };
  }, [chatId, fetchMessages, markChatAsRead, setupRealtimeSubscription, cleanupRealtimeSubscription]);

  useEffect(() => {
    if (!isInitialLoad) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isInitialLoad]);

  const displayName = `${otherUser.first_name} ${otherUser.last_name.charAt(0)}.`;

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <CustomText className="text-lg text-blue-500">←</CustomText>
          </TouchableOpacity>
          <Image
            source={
              otherUser.profile_icon_url
                ? { uri: otherUser.profile_icon_url }
                : require("@/assets/images/profile_icon.jpg")
            }
            className="w-12 h-12 rounded-full"
          />
          <View className="flex-1">
            <CustomText className="font-poppins-semibold text-lg text-gray-900">
              {displayName}
            </CustomText>
            <CustomText className="font-poppins-regular text-sm text-gray-500">
              {isOnline ? 'Online' : 'Offline'} {loadingMore && '• Loading...'}
            </CustomText>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-gray-100 px-4 py-4"
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
              const showTime = index === messages.length - 1 || 
                messages[index + 1]?.sender_id !== message.sender_id;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showTime={showTime}
                  showSenderName={true}
                />
              );
            })
          )}
        </ScrollView>
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-end gap-3">
            <View className="flex-1 bg-gray-100 rounded-full px-4 py-3 min-h-[44px] justify-center">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={1000}
                className="font-poppins-regular text-base text-gray-900 max-h-24"
                style={{ textAlignVertical: 'top' }}
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
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            >
              {sending ? (
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CustomText className="text-white text-lg">→</CustomText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;