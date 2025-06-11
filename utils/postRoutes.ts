import { findChatBetweenUsers } from "./getRoutes";
import { ChatData, ChatMessage, ChatWithParticipants, Level, Review, StudentProfile, Subject, TutorProfile, TutorSubject, UserProfile } from "./models";
import { supabase } from "./supabase";

export const postUserProfile = async (profile : UserProfile) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .insert(profile);
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error posting user profile:", error)
        throw error;
    }
}

export const postTutorProfile = async (profile : TutorProfile) => {
    try {
        const { data, error } = await supabase
            .from("tutors")
            .insert(profile);
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error posting tutor profile:", error)
        throw error;
    }
}

export const postStudentProfile = async (profile : StudentProfile) => {
    try {
        const { data, error } = await supabase
            .from("students")
            .insert(profile);
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error posting student profile:", error)
        throw error;
    }
}

export const updateUserProfile = async (profile : UserProfile) => {
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
        console.error("Error updating user profile:", error)
        throw error;
    }
}

export const updateTutorProfile = async (profile : TutorProfile) => {
    try {
        const { data, error } = await supabase
            .from("tutors")
            .update(profile)
            .eq("id", profile.id)
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error updating tutor profile:", error)
        throw error;
    }
}

export const updateStudentProfile = async (profile : StudentProfile) => {
    try {
        const { data, error } = await supabase
            .from("students")
            .update(profile)
            .eq("id", profile.id)
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error updating student profile:", error)
        throw error;
    }
}

export const postSubject = async (subject : Subject) => {
    try {
        const { data, error } = await supabase
            .from("subjects")
            .insert(subject);
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error posting subject:", error)
        throw error;
    }
}

export const postLevel = async (level : Level) => {
    try {
        const { data, error } = await supabase
            .from("levels")
            .insert(level);
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error posting level:", error)
        throw error;
    }
}

export const postReview = async (review : Review) => {
    try {
        const { data, error } = await supabase
            .from("reviews")
            .insert(review);
        
        if (error) {
            throw error;
        }
        
        return data;
        
    } catch (error) {
        console.error("Error posting review:", error)
        throw error;
    }
}

export const postTutorSubject = async (tutor_subject : TutorSubject) => {{
    try {
        const { data, error } = await supabase
            .from("tutor_subjects")
            .insert(tutor_subject);

        if (error) {
            throw error;
        }

        return data;

    } catch (error) {
        console.error("Error posting tutor subject:", error)
        throw error;
    }
}}

export const postChatMessage = async (
  messageData: Omit<ChatMessage, 'id' | 'created_at' | 'read' | 'chat_id'>,
  senderRole: "tutor" | "student",
  tutorId: string,
  studentId: string
): Promise<{ message: ChatMessage, chat: ChatWithParticipants, wasNewChat: boolean }> => {
  try {
    // Try to find existing chat first
    let chat = await findChatBetweenUsers(tutorId, studentId);
    let wasNewChat = false;

    // If no chat exists, create one
    if (!chat) {
      const newChatData: Omit<ChatData, 'id'> = {
        tutor_id: tutorId,
        student_id: studentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count_tutor: 0,
        unread_count_student: 0
      };

      const { data, error } = await supabase
        .from("chats")
        .insert(newChatData)
        .select(`
          *,
          tutor:tutor_id (
            id,
            first_name,
            last_name,
            profile_icon_url,
            email,
            location
          ),
          student:student_id (
            id,
            first_name,
            last_name,
            profile_icon_url,
            email,
            location
          )
        `)
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
        read: false
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // Increment unread count for recipient
    const unreadField = senderRole === 'tutor' ? 'unread_count_student' : 'unread_count_tutor';
    
    const { error: chatUpdateError } = await supabase
        .rpc('increment_unread_count', {
            chat_id_param: chat.id,
            field_name: unreadField
        });

    if (chatUpdateError) {
        console.error("Error updating chat counters:", chatUpdateError);
    }

    return { 
      message: messageResult as ChatMessage, 
      chat,
      wasNewChat 
    };
  } catch (error) {
    console.error("Error posting chat message:", error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: number, userId: string) => {
  try {
    // Mark messages as read
    const { error: messageError } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("chat_id", chatId)
      .eq("recipient_id", userId)
      .eq("read", false);

    if (messageError) throw messageError;

    // Reset unread count for this user
    const { data: chat } = await supabase
      .from("chats")
      .select("tutor_id")
      .eq("id", chatId)
      .single();

    const isUserTutor = chat?.tutor_id === userId;
    const unreadField = isUserTutor ? 'unread_count_tutor' : 'unread_count_student';

    const { error: chatError } = await supabase
      .from("chats")
      .update({ [unreadField]: 0 })
      .eq("id", chatId);

    if (chatError) throw chatError;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};