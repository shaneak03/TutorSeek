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
  const [connectionStatus, setConnectionStatus] = useState<string>('DISCONNECTED');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isComponentMountedRef = useRef(true);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3; // Reduced from 5
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Single subscription state to prevent duplicates
  const subscriptionStateRef = useRef<{
    isSetupInProgress: boolean;
    isConnected: boolean;
    shouldReconnect: boolean;
  }>({
    isSetupInProgress: false,
    isConnected: false,
    shouldReconnect: true
  });
  
  const PAGE_SIZE = 50;

  // Memoize static values to prevent unnecessary re-renders
  const staticChatId = useMemo(() => chatId, []);
  const staticOtherUser = useMemo(() => otherUser, []);
  const staticUserId = useMemo(() => user?.id, [user?.id]);

  // Memoize online status check to prevent unnecessary re-renders
  const isOtherUserOnline = useMemo(() => {
    return onlineUsers[staticOtherUser.id?.toString()] !== undefined;
  }, [onlineUsers, staticOtherUser.id]);

  // Transform message to include sender info - memoized with stable dependencies
  const transformMessage = useCallback((msg: any): ChatMessageWithSender => ({
    ...msg,
    sender: {
      id: msg.sender_id,
      first_name: msg.sender_id === staticUserId ? 'You' : staticOtherUser.first_name,
      last_name: msg.sender_id === staticUserId ? '' : staticOtherUser.last_name,
      profile_icon_url: msg.sender_id === staticUserId ? '' : staticOtherUser.profile_icon_url,
      role: msg.sender_id === staticUserId ? (user as UserProfile).role : staticOtherUser.role
    }
  }), [staticUserId, staticOtherUser, user]);

  const markChatAsRead = useCallback(async () => {
    if (!staticUserId) return;
    try {
      await markMessagesAsRead(staticChatId, staticUserId);
      
      // Broadcast read status to other users
      if (channelRef.current && subscriptionStateRef.current.isConnected) {
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

  // Clear any pending reconnection timeouts
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Cleanup function
  const cleanupRealtimeSubscription = useCallback(() => {
    console.log('Starting realtime subscription cleanup...');
    
    // Clear any pending reconnection attempts
    clearReconnectTimeout();
    subscriptionStateRef.current.shouldReconnect = false;
    
    if (channelRef.current) {
      try {
        console.log('Unsubscribing from channel...');
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        console.log('Channel cleanup completed');
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
      } finally {
        channelRef.current = null;
        setConnectionStatus('DISCONNECTED');
      }
    }
    
    // Reset subscription state
    subscriptionStateRef.current = {
      isSetupInProgress: false,
      isConnected: false,
      shouldReconnect: false
    };
    reconnectAttempts.current = 0;
  }, [clearReconnectTimeout]);

  // Setup Supabase realtime subscription 
  const setupRealtimeSubscription = useCallback(async () => {
    // Prevent multiple simultaneous setup attempts
    if (subscriptionStateRef.current.isSetupInProgress) {
      console.log('Setup already in progress, skipping...');
      return;
    }
    
    if (!staticUserId || !isComponentMountedRef.current || !subscriptionStateRef.current.shouldReconnect) {
      console.log('Cannot setup subscription: missing requirements');
      return;
    }

    subscriptionStateRef.current.isSetupInProgress = true;
    
    try {
      // Clean up existing channel first
      if (channelRef.current) {
        console.log('Cleaning up existing channel before setup...');
        try {
          channelRef.current.unsubscribe();
          await supabase.removeChannel(channelRef.current);
        } catch (cleanupError) {
          console.warn('Error during existing channel cleanup:', cleanupError);
        }
        channelRef.current = null;
        subscriptionStateRef.current.isConnected = false;
      }

      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if component is still mounted and should reconnect
      if (!isComponentMountedRef.current || !subscriptionStateRef.current.shouldReconnect) {
        console.log('Component unmounted or reconnect disabled during setup delay, aborting...');
        subscriptionStateRef.current.isSetupInProgress = false;
        return;
      }

      console.log('Setting up new chat channel for chat:', staticChatId);

      // Create unique channel name to prevent conflicts
      const channelName = `chat-${staticChatId}-${staticUserId}-${Date.now()}`;
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: staticUserId.toString() }
        }
      });
      
      // Event listeners
      channel
        .on('broadcast', { event: 'new_message' }, (payload) => {
          console.log('Received new message via broadcast:', payload);
            
          if (!isComponentMountedRef.current || !subscriptionStateRef.current.isConnected) return;
            
          const newMessage = payload.payload;
            
          if (newMessage.chat_id === staticChatId && newMessage.sender_id !== staticUserId) {
            const messageWithSender = transformMessage(newMessage);
              
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;
                
              return [...prev, messageWithSender];
            });
              
            setTimeout(() => {
              if (scrollViewRef.current && isComponentMountedRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
              }
            }, 100);
              
            markChatAsRead();
          }
        })
        .on('broadcast', { event: 'messages_read' }, (payload) => {
          console.log('Messages marked as read:', payload);
            
          if (!isComponentMountedRef.current || !subscriptionStateRef.current.isConnected) return;
          
          const { chat_id, user_id } = payload.payload;
            
          if (chat_id === staticChatId && user_id !== staticUserId) {
            setMessages(prev => 
              prev.map(msg => 
                msg.sender_id === staticUserId ? { ...msg, read: true } : msg
              )
            );
          }
        })
        .on('presence', { event: 'sync' }, () => {
          if (!isComponentMountedRef.current || !subscriptionStateRef.current.isConnected) return;
          console.log('Chat presence sync');
        })
        .on('presence', { event: 'join' }, ({ key }) => {
          if (subscriptionStateRef.current.isConnected) {
            console.log('User joined chat:', key);
          }
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          if (subscriptionStateRef.current.isConnected) {
            console.log('User left chat:', key);
          }
        })
        .subscribe(async (status, err) => {
          console.log(`Chat subscription status: ${status}`, err);
          
          if (!isComponentMountedRef.current) {
            console.log('Component unmounted, ignoring subscription status');
            return;
          }
          
          setConnectionStatus(status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to chat channel');
            subscriptionStateRef.current.isConnected = true;
            subscriptionStateRef.current.isSetupInProgress = false;
            reconnectAttempts.current = 0;
            
            try {
              const trackResult = await channel.track({
                user_id: staticUserId,
                chat_id: staticChatId,
                online_at: new Date().toISOString(),
              });
              console.log('User tracked in chat:', staticUserId, staticChatId, trackResult);
            } catch (presenceError) {
              console.error('Error tracking chat presence:', presenceError);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            subscriptionStateRef.current.isConnected = false;
            subscriptionStateRef.current.isSetupInProgress = false;
            
            // Only attempt reconnection if we should reconnect and haven't exceeded max attempts
            if (subscriptionStateRef.current.shouldReconnect && 
                reconnectAttempts.current < maxReconnectAttempts && 
                isComponentMountedRef.current) {
              
              reconnectAttempts.current++;
              const delay = Math.min(2000 * Math.pow(2, reconnectAttempts.current - 1), 10000);
              
              console.log(`Scheduling reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms after ${status}...`);
              
              clearReconnectTimeout(); // Clear any existing timeout
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isComponentMountedRef.current && subscriptionStateRef.current.shouldReconnect) {
                  console.log(`Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}...`);
                  setupRealtimeSubscription();
                }
              }, delay);
            } else {
              console.error(`Max reconnection attempts reached, component unmounted, or reconnect disabled. Status: ${status}`);
            }
          }
        });

      channelRef.current = channel;

    } catch (error) {
      console.error('Error setting up chat realtime subscription:', error);
      subscriptionStateRef.current.isSetupInProgress = false;
      subscriptionStateRef.current.isConnected = false;
      
      // Only retry on error if we should reconnect and haven't exceeded max attempts
      if (subscriptionStateRef.current.shouldReconnect && 
          isComponentMountedRef.current && 
          reconnectAttempts.current < maxReconnectAttempts) {
        
        reconnectAttempts.current++;
        const delay = 3000;
        
        console.log(`Scheduling retry after error in ${delay}ms...`);
        clearReconnectTimeout();
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isComponentMountedRef.current && subscriptionStateRef.current.shouldReconnect) {
            setupRealtimeSubscription();
          }
        }, delay);
      }
    }
  }, [staticChatId, staticUserId, transformMessage, markChatAsRead, clearReconnectTimeout]);

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
      if (channelRef.current && subscriptionStateRef.current.isConnected) {
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

  // Single initialization effect
  useEffect(() => {
    console.log('Initializing chat screen for chat ID:', staticChatId);
    isComponentMountedRef.current = true;
    subscriptionStateRef.current.shouldReconnect = true;
    
    const initialize = async () => {
      try {
        // Load initial messages
        await fetchMessages();
        await markChatAsRead();
        
        // Setup realtime subscription after initial load
        if (staticUserId && staticChatId) {
          setTimeout(() => {
            if (isComponentMountedRef.current && subscriptionStateRef.current.shouldReconnect) {
              setupRealtimeSubscription();
            }
          }, 1000); 
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };
    
    initialize();

    return () => {
      console.log('Chat screen unmounting, cleaning up...');
      isComponentMountedRef.current = false;
      cleanupRealtimeSubscription();
    };
  }, [staticChatId, staticUserId, fetchMessages, markChatAsRead, setupRealtimeSubscription, cleanupRealtimeSubscription]);

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

  const displayName = useMemo(() => 
    `${staticOtherUser.first_name} ${staticOtherUser.last_name.charAt(0)}.`,
    [staticOtherUser.first_name, staticOtherUser.last_name]
  );

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
            className="w-12 h-12 rounded-full"
          />
          <View className="flex-1">
            <CustomText className="font-poppins-semibold text-lg text-gray-900">
              {displayName}
            </CustomText>
            <CustomText className="font-poppins-regular text-sm text-gray-500">
              {isOtherUserOnline ? 'Online' : 'Offline'}
              {loadingMore && ' • Loading...'}
              {connectionStatus !== 'SUBSCRIBED' && connectionStatus !== 'DISCONNECTED' && (
                <> • {connectionStatus}</>
              )}
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
        <View className="bg-neutral-100 border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-neutral-200 rounded-full px-4 py-2 min-h-[44px] max-h-24">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message"
                placeholderTextColor="#9CA3AF"
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