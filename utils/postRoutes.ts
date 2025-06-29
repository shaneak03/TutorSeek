import { TutorProfileData } from "@/app/(tabs)/(profile)";
import { findChatBetweenUsers } from "./getRoutes";

import {
  ChatData,
  ChatMessage,
  ChatWithParticipants,
  UserProfile,
} from "./models";
import { supabase } from "./supabase";

/// Timetable ///

export const createTimeTable = async (tutorId: string) => {
  try {
    const { count, error: countError } = await supabase
      .from("timeslots")
      .select("*", { count: "exact", head: true });
    if (countError) {
      throw countError;
    }
    let slots = [];
    for (let d = 0; d < 7; d++) {
      for (let t_id = 1; t_id <= (count ?? 0); t_id++) {
        slots.push({ tutor_id: tutorId, day: d, timeslot_id: t_id });
      }
    }
    const { error: insertError } = await supabase
      .from("teaching_slots")
      .insert(slots);
    if (insertError) throw new Error(insertError.message);
  } catch (error) {
    console.log("Error creating timetable" + error);
  }
};

/// Profile ///

export const updateUserProfile = async (profile: UserProfile) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(profile)
      .eq("id", profile.id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const updateTutorProfile = async (profile: TutorProfileData) => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .update({
        id: profile.id,
        bio: profile.bio,
        hourly_rate: profile.hourly_rate,
        is_published: profile.is_published,
      })
      .eq("id", profile.id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating tutor profile:", error);
    throw error;
  }
};

/// Tutor subjects ///

export const addTutorSubjects = async (
  subjects: {
    id: number;
    level: number;
    subject: number;
  }[],
  tutorId: string
) => {
  try {
    const { data, error } = await supabase.from("tutor_subjects").insert(
      subjects.map(s => ({
        subject_id: s.subject,
        level_id: s.level,
        tutor_id: tutorId,
      }))
    );
    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error adding tutor subjects", error);
    throw error;
  }
};

export const deleteTutorSubjects = async (ids: number[], tutorId: string) => {
  try {
    const { data, error } = await supabase
      .from("tutor_subjects")
      .delete()
      .in("id", ids)
      .eq("tutor_id", tutorId);
    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error removing tutor subjects", error);
    throw error;
  }
};

/// Reviews ///

export const updateRatingReview = async (
  avgRating: number,
  reviewCount: number,
  tutorId: string
) => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .update({
        rating_count: avgRating,
        review_count: reviewCount,
      })
      .eq("id", tutorId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating rating and review count", error);
    throw error;
  }
};

export const postReview = async (
  student_id: string,
  tutor_id: string,
  rating: number,
  description: string
) => {
  try {
    const { error } = await supabase
      .from("reviews")
      .insert({ student_id, tutor_id, rating, description });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error posting review:", error);
    throw error;
  }
};

/// Chat page ///

export const updateLastSeen = async (userId: string) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ last_online_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;
    console.log(`Updated last_online_at for user ${userId}`);
  } catch (err) {
    console.error("Failed to update last_online_at:", err);
  }
};

export const postChatMessage = async (
  messageData: Omit<ChatMessage, "id" | "created_at" | "read" | "chat_id">,
  senderRole: "tutor" | "student",
  tutorId: string,
  studentId: string
): Promise<{
  message: ChatMessage;
  chat: ChatWithParticipants;
  wasNewChat: boolean;
}> => {
  try {
    // Try to find existing chat first
    let chat = await findChatBetweenUsers(tutorId, studentId);
    let wasNewChat = false;

    // If no chat exists, create one
    if (!chat) {
      const newChatData: Omit<ChatData, "id"> = {
        tutor_id: tutorId,
        student_id: studentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count_tutor: 0,
        unread_count_student: 0,
      };

      const { data, error } = await supabase
        .from("chats")
        .insert(newChatData)
        .select(
          `
          *,
          tutor:users!chats_tutor_id_fkey (*),
          student:users!chats_student_id_fkey (*)
        `
        )
        .single();

      if (error) throw error;
      chat = data as ChatWithParticipants;
      wasNewChat = true;
    }

    // Insert message
    const { data: messageResult, error: messageError } = await supabase
      .from("messages")
      .insert({
        ...messageData,
        chat_id: chat.id,
        created_at: new Date().toISOString(),
        read: false,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Increment unread count for recipient
    const unreadField =
      senderRole === "tutor" ? "unread_count_student" : "unread_count_tutor";

    const { error: rpcError } = await supabase.rpc("increment_unread_count", {
      chat_id_param: chat.id,
      field_name: unreadField,
    });

    if (rpcError) throw rpcError;

    return {
      message: messageResult as ChatMessage,
      chat,
      wasNewChat,
    };
  } catch (error) {
    console.error("Error posting chat message:", error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: number, userId: string) => {
  try {
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("tutor_id")
      .eq("id", chatId)
      .single();

    if (chatError) throw chatError;
    if (!chat) throw new Error("Chat not found");

    const isUserTutor = chat.tutor_id === userId;
    const unreadField = isUserTutor
      ? "unread_count_tutor"
      : "unread_count_student";

    const { error: rpcError } = await supabase.rpc("mark_messages_read", {
      chat_id_param: chatId,
      user_id_param: userId,
      field_name: unreadField,
    });

    if (rpcError) throw rpcError;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};
