import { AuthContext, RealtimeContext } from "@/app/_layout";
import CustomText from "@/app/components/CustomText";
import MessageBubble from "@/app/components/MessageBubble";
import { getChatMessagesByChatIdAndPages } from "@/utils/getRoutes";
import { ChatMessageWithSender, UserProfile } from "@/utils/models";
import { markMessagesAsRead, postChatMessage } from "@/utils/postRoutes";
import { sendPushNotification } from "@/utils/pushNotification";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PostReviewModal from "../components/PostReviewModal";
import UserIcon from "../components/UserIcon";
import themeColors from "../themeColors";

interface MessageItem {
  id: string;
  type: "message" | "date-separator";
  message?: ChatMessageWithSender;
  dateText?: string;
}

const ChatScreen = () => {
  const { user } = useContext(AuthContext);
  const { onlineUsers, globalChatChannel } = useContext(RealtimeContext);

  const router = useRouter();
  const params = useLocalSearchParams();
  const chatId = params.id === "new" ? null : Number(params.id);
  const otherUser = JSON.parse(params.otherUser as string);
  const isOtherUserOnline = Boolean(onlineUsers[otherUser.id]);

  const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isShowReviewModal, setIsShowReviewModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isComponentMountedRef = useRef(true);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 120) return `${Math.floor(diffMins / 60)} hour ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    if (diffMins < 2880) return `${Math.floor(diffMins / 1440)} day ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = date.toDateString();
    const todayDate = today.toDateString();
    const yesterdayDate = yesterday.toDateString();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    if (messageDate === todayDate) {
      return "Today";
    } else if (messageDate === yesterdayDate) {
      return "Yesterday";
    } else if (date >= startOfWeek && date < today) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
      });
    } else {
      return date.toLocaleDateString("en-SG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const needsDateSeparator = (
    currentMessage: ChatMessageWithSender,
    previousMessage?: ChatMessageWithSender
  ) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = new Date(previousMessage.created_at).toDateString();

    return currentDate !== previousDate;
  };

  const PAGE_SIZE = 50;

  // Memoize static values to prevent unnecessary re-renders
  const staticChatId = useMemo(() => chatId, []); // eslint-disable-line react-hooks/exhaustive-deps
  const staticOtherUser = useMemo(() => otherUser, []); // eslint-disable-line react-hooks/exhaustive-deps
  const staticUserId = useMemo(() => user?.id, [user?.id]);

  // Transform messages into FlatList items with date separators
  const flatListData = useMemo((): MessageItem[] => {
    const items: MessageItem[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const previousMessage = i > 0 ? messages[i - 1] : undefined;

      if (needsDateSeparator(message, previousMessage)) {
        items.push({
          id: `date-${message.created_at}`,
          type: "date-separator",
          dateText: formatDateSeparator(message.created_at),
        });
      }

      // Add the message
      items.push({
        id: `message-${message.id}`,
        type: "message",
        message,
      });
    }

    return items.reverse();
  }, [messages]);

  // Transform message to include sender info
  const transformMessage = useCallback(
    (msg: any): ChatMessageWithSender => ({
      ...msg,
      sender: {
        id: msg.sender_id,
        first_name:
          msg.sender_id === staticUserId ? "You" : staticOtherUser.first_name,
        last_name:
          msg.sender_id === staticUserId ? "" : staticOtherUser.last_name,
        profile_icon_url:
          msg.sender_id === staticUserId
            ? ""
            : staticOtherUser.profile_icon_url,
        role:
          msg.sender_id === staticUserId
            ? (user as UserProfile).role
            : staticOtherUser.role,
      },
    }),
    [staticUserId, staticOtherUser, user]
  );

  const markChatAsRead = useCallback(async () => {
    if (!staticUserId || !staticChatId) return;
    try {
      await markMessagesAsRead(staticChatId, staticUserId);

      // Broadcast read status to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "messages_read",
          payload: {
            chat_id: staticChatId,
            user_id: staticUserId,
            read_at: new Date().toISOString(),
          },
        });
      }

      if (globalChatChannel) {
        await globalChatChannel.send({
          type: "broadcast",
          event: "messages_read",
          payload: {
            chat_id: staticChatId,
            user_id: staticUserId,
            read_at: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [staticChatId, staticUserId]);

  const setupChatChannel = useCallback(() => {
    if (!staticUserId || !isComponentMountedRef.current) return;

    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
    }
    // Use temporary channel name for new chats
    const channelName = staticChatId
      ? `chat-${staticChatId}`
      : `new-chat-${staticUserId}-${staticOtherUser.id}`;

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "new_message" }, payload => {
        if (!isComponentMountedRef.current) return;

        const newMessage = payload.payload;
        if (
          newMessage.chat_id === staticChatId &&
          newMessage.sender_id !== staticUserId
        ) {
          const messageWithSender = transformMessage(newMessage);

          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;

            return [...prev, messageWithSender];
          });

          markChatAsRead();
        }
      })
      .on("broadcast", { event: "messages_read" }, payload => {
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
  const fetchMessages = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!staticChatId) return;
      try {
        if (!append) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const fetchedMessages = await getChatMessagesByChatIdAndPages(
          staticChatId,
          page,
          PAGE_SIZE
        );

        const messagesWithSender: ChatMessageWithSender[] =
          fetchedMessages.map(transformMessage);

        if (append) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.id));
            const newMessages = messagesWithSender.filter(
              msg => !existingIds.has(msg.id)
            );
            return [...newMessages, ...prev].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
          });
        } else {
          const sortedMessages = messagesWithSender.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          setMessages(sortedMessages);
        }
        setHasMoreMessages(fetchedMessages.length === PAGE_SIZE);
      } catch (error) {
        console.error("Error fetching messages:", error);
        Alert.alert("Error", "Failed to load messages");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [staticChatId, transformMessage]
  );

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

  const navToUser = () => {
    if (otherUser.role === "student") return;
    router.push(`/viewTutor/${otherUser?.id}`);
  };

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !user || sending) return;

    const messageContent = messageText.trim();
    let optimisticMessage: ChatMessageWithSender | null = null;

    try {
      setSending(true);

      const currentUserProfile = user as UserProfile;
      const senderRole = currentUserProfile.role;

      let tutorId: string;
      let studentId: string;

      if (senderRole === "tutor") {
        tutorId = user.id;
        studentId = staticOtherUser.id;
      } else if (senderRole === "student") {
        tutorId = staticOtherUser.id;
        studentId = user.id;
      } else {
        console.error("Invalid current user role:", senderRole);
        console.error(
          'Expected "tutor" or "student", got:',
          typeof senderRole,
          senderRole
        );
        throw new Error(
          `Invalid current user role for chat: "${senderRole}". Expected "tutor" or "student".`
        );
      }

      if (tutorId === studentId) {
        throw new Error("Tutor and student cannot be the same person");
      }

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
          first_name: "You",
          last_name: "",
          profile_icon_url: "",
          role: senderRole,
        },
      };

      setMessages(prev => [...prev, optimisticMessage!]);
      setMessageText("");

      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError) throw authError;

      const currentUserId = userData?.user?.id;
      console.log(
        "Inserting chat as:",
        currentUserId,
        "tutorId:",
        tutorId,
        "studentId:",
        studentId
      );
      console.log(
        "Current user role:",
        senderRole,
        "Other user role:",
        staticOtherUser.role
      );

      const {
        message: newMessage,
        chat: newChat,
        wasNewChat,
      } = await postChatMessage(
        {
          sender_id: user.id,
          recipient_id: staticOtherUser.id,
          content: messageContent,
        },
        senderRole,
        tutorId,
        studentId
      );

      if (wasNewChat) {
        router.setParams({
          id: String(newChat.id),
          otherUser: JSON.stringify(staticOtherUser),
        });

        setupChatChannel();
      }

      // Replace optimistic message with real message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage!.id
            ? {
                ...newMessage,
                sender: optimisticMessage!.sender,
                chat_id: newChat.id,
              }
            : msg
        )
      );

      // Broadcast new message to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: newMessage,
        });
      }

      if (globalChatChannel) {
        await globalChatChannel.send({
          type: "broadcast",
          event: "new_message",
          payload: newMessage,
        });
      }

      await sendPushNotification(
        staticOtherUser.id,
        `${user.first_name} ${user.last_name}`,
        messageContent,
        "message",
        {
          chatId: newChat.id,
          messageId: newMessage.id,
          senderId: user.id,
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");

      if (optimisticMessage) {
        setMessages(prev =>
          prev.filter(msg => msg.id !== optimisticMessage!.id)
        );
      }

      setMessageText(messageContent);
    } finally {
      setSending(false);
    }
  }, [messageText, user, sending, staticOtherUser.id, staticChatId, router]);
  // Render item for FlatList
  const renderItem: ListRenderItem<MessageItem> = useCallback(
    ({ item }) => {
      if (item.type === "date-separator") {
        return (
          <View className='items-center my-4'>
            <View className='bg-gray-400 px-3 py-1 rounded-full'>
              <CustomText className='text-sm text-white font-poppins-medium'>
                {item.dateText}
              </CustomText>
            </View>
          </View>
        );
      }

      if (item.type === "message" && item.message) {
        const isCurrentUser = item.message.sender_id === user?.id;
        return (
          <MessageBubble message={item.message} isCurrentUser={isCurrentUser} />
        );
      }

      return null;
    },
    [user?.id]
  );

  // Key extractor
  const keyExtractor = useCallback((item: MessageItem) => item.id, []);

  // List header component (for loading more messages and refresh)
  const ListFooterComponent = useCallback(() => {
    return (
      <View>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          className='py-4 items-center'
          activeOpacity={0.7}
        >
          {refreshing ? (
            <View className='flex-row items-center gap-2'>
              <View className='w-4 h-4 border-2 border-primary-700 border-t-transparent rounded-full animate-spin' />
              <CustomText className='text-primary-700 text-sm'>
                Refreshing...
              </CustomText>
            </View>
          ) : staticChatId ? (
            <CustomText className='text-primary-700 text-sm'>
              Press to refresh
            </CustomText>
          ) : null}
        </TouchableOpacity>
        {loadingMore && (
          <View className='py-2 items-center'>
            <View className='flex-row items-center gap-2'>
              <View className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
              <CustomText className='text-gray-500 text-sm'>
                Loading older messages...
              </CustomText>
            </View>
          </View>
        )}
      </View>
    );
  }, [loadingMore, refreshing, onRefresh]);

  // List empty component
  const ListEmptyComponent = useCallback(() => {
    if (loading && staticChatId) {
      return (
        <View
          className='flex-1 justify-center items-center py-20'
          style={{ transform: [{ scaleX: -1 }, { scaleY: -1 }] }}
        >
          <CustomText className='text-gray-500'>Loading messages...</CustomText>
        </View>
      );
    }

    return (
      <View
        className='flex-1 justify-center items-center py-20'
        style={{ transform: [{ scaleX: -1 }, { scaleY: -1 }] }}
      >
        <CustomText className='text-gray-500 text-center'>
          No messages yet. Start the conversation!
        </CustomText>
      </View>
    );
  }, [loading]);

  // Initialization
  useEffect(() => {
    isComponentMountedRef.current = true;

    const initialize = async () => {
      if (staticChatId) {
        await fetchMessages();
        await markChatAsRead();
      }
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
  }, [fetchMessages, markChatAsRead, setupChatChannel, staticChatId]);

  const displayName = `${staticOtherUser.first_name} ${staticOtherUser.last_name}`;

  return (
    <>
      <PostReviewModal
        isVisible={isShowReviewModal}
        setIsVisible={setIsShowReviewModal}
        tutorId={otherUser?.id}
      />
      <SafeAreaView className='flex-1 bg-neutral-100'>
        <View className='bg-neutral-100 border-b border-gray-200 px-4 py-3'>
          <View className='flex-row items-center gap-3'>
            <TouchableOpacity
              onPress={() => router.back()}
              className='w-10 h-10 rounded-full bg-neutral-100 items-center justify-center'
              activeOpacity={0.7}
            >
              <Ionicons name='chevron-back' size={20} />
            </TouchableOpacity>
            <Pressable onPress={navToUser}>
              <UserIcon
                avatarUrl={
                  staticOtherUser.profile_icon_url
                    ? staticOtherUser.profile_icon_url
                    : ""
                }
                size={48}
              />
            </Pressable>
            <View className='flex-1 flex-row justify-between items-center'>
              <View className='flex'>
                <CustomText className='font-poppins-bold text-xl'>
                  {displayName}
                </CustomText>
                <CustomText className='font-poppins-regular text-sm text-gray-500'>
                  {isOtherUserOnline
                    ? "Online"
                    : `Last seen ${formatRelativeTime(
                        staticOtherUser.last_online_at
                      )}`}
                </CustomText>
              </View>
              {user?.role === "student" && (
                <Pressable onPress={() => setIsShowReviewModal(true)}>
                  <Image
                    source={require("../../assets/images/review.png")}
                    style={{ width: 24, height: 24 }}
                    contentFit='cover'
                  />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <FlatList
            ref={flatListRef}
            data={flatListData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            className='flex-1 bg-neutral-200 px-4'
            showsVerticalScrollIndicator={false}
            inverted={true}
            onEndReached={() => {
              if (hasMoreMessages && !loadingMore && !loading) {
                loadMoreMessages();
              }
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={ListFooterComponent}
            ListEmptyComponent={ListEmptyComponent}
            maintainVisibleContentPosition={{
              minIndexForVisible: 1,
              autoscrollToTopThreshold: 50,
            }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={20}
            windowSize={10}
          />
          <View className='bg-neutral-100 border-t border-gray-200 px-4 py-3'>
            <View className='flex-row items-center gap-3'>
              <View className='flex-1 bg-neutral-200 rounded-full px-4 py-2 min-h-[44px] max-h-24'>
                <TextInput
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder='Type a message'
                  placeholderTextColor={themeColors["neutral-300"]}
                  multiline
                  maxLength={1000}
                  className='font-poppins-regular text-base text-gray-900 max-h-24'
                  style={{ textAlignVertical: "center" }}
                  returnKeyType='send'
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
                    ? "bg-primary-700"
                    : "bg-gray-300"
                }`}
                activeOpacity={0.7}
              >
                {sending ? (
                  <View className='w-5 h-5 border-2 border-neutral-100 border-t-transparent rounded-full animate-spin' />
                ) : (
                  <Ionicons name='send' size={18} color='white' />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default ChatScreen;
