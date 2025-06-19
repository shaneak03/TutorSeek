import { filterOptions } from "../app/components/HomeTopNav";
import {
  ChatMessage,
  ChatWithParticipants,
  Level,
  StudentProfile,
  Subject,
  TutorProfile,
  UserProfile
} from "./models";
import { supabase } from "./supabase";

export const getTutors = async (filters: filterOptions) => {
  let query = supabase
    .from("tutor_distinct")
    .select("*")
    .eq("is_published", true)
    .gte("hourly_rate", filters.minPrice)
    .lte("hourly_rate", filters.maxPrice);

  if (filters.subject !== 0) {
    query = query.eq("subject_id", filters.subject);
  }
  if (filters.level !== 0) {
    query = query.eq("level_id", filters.level);
  }
  if (filters.rating > 1) {
    query = query.gte("rating_count", filters.rating);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching tutors:", error);
    return [];
  }

  const dedupedTutors = Array.from(
    new Map(data.map(tutor => [tutor.tutor_id, tutor])).values()
  );

  //Sorting
  if (filters.sortBy === "price_asc") {
    return dedupedTutors.sort((a, b) => a.hourly_rate - b.hourly_rate);
  } else if (filters.sortBy === "price_desc") {
    return dedupedTutors.sort((a, b) => b.hourly_rate - a.hourly_rate);
  } else if (filters.sortBy === "rating_asc") {
    return dedupedTutors.sort((a, b) => a.rating_count - b.rating_count);
  } else {
    return dedupedTutors.sort((a, b) => b.rating_count - a.rating_count);
  }
};

export const getSubjectsByTutorId = async (tutor_id: string) => {
  try {
    const { data, error } = await supabase
      .from("tutor_subjects_flatten")
      .select("subject, level, id")
      .eq("tutor_id", tutor_id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting tutor subjects:", error);
    throw error;
  }
};

export const getTutorById = async (tutorId: string): Promise<TutorProfile> => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .eq("id", tutorId)
      .single();

    if (error) {
      throw error;
    }

    return data as TutorProfile;
  } catch (error) {
    console.error("Error getting tutor by ID:", error);
    throw error;
  }
};

export const getPageOfTutors = async (
  page: number,
  pageSize: number
): Promise<TutorProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      throw error;
    }

    return data as TutorProfile[];
  } catch (error) {
    console.error("Error getting page of tutors:", error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<UserProfile> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

export const getStudentById = async (
  studentId: string
): Promise<StudentProfile> => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (error) {
      throw error;
    }

    return data as StudentProfile;
  } catch (error) {
    console.error("Error getting student by ID:", error);
    throw error;
  }
};

export const getLevels = async (): Promise<Level[]> => {
  try {
    const { data, error } = await supabase.from("levels").select("*");

    if (error) {
      throw error;
    }

    return data as Level[];
  } catch (error) {
    console.error("Error getting levels:", error);
    throw error;
  }
};

export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("id");

    if (error) {
      throw error;
    }

    return data as Subject[];
  } catch (error) {
    console.error("Error getting subjects:", error);
    throw error;
  }
};

export const getReviewsByStudentId = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `*, 
        students (
          users (
            first_name,
            last_name,
            profile_icon_url
          )
        )`
      )
      .eq("student_id", studentId);

    if (error) {
      throw error;
    }

    return data.map(r => ({
      ...r,
      profile_icon_url: r.students.users.profile_icon_url,
      first_name: r.students.users.first_name,
      last_name: r.students.users.last_name,
    }));
  } catch (error) {
    console.error("Error getting tutor reviews", error);
    throw error;
  }
};
export const getReviewsByTutorId = async (tutorId: string) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `*, 
        students (
          users (
            first_name,
            last_name,
            profile_icon_url
          )
        )`
      )
      .eq("tutor_id", tutorId);

    if (error) {
      throw error;
    }

    return data.map(r => ({
      ...r,
      profile_icon_url: r.students.users.profile_icon_url,
      first_name: r.students.users.first_name,
      last_name: r.students.users.last_name,
    }));
  } catch (error) {
    console.error("Error getting tutor reviews", error);
    throw error;
  }
};

export const getSubjectById = async (subjectId: string): Promise<Subject> => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single();

    if (error) {
      throw error;
    }

    return data as Subject;
  } catch (error) {
    console.error("Error getting subject by id", error);
    throw error;
  }
};

export const getLevelById = async (levelId: string): Promise<Level> => {
  try {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .eq("id", levelId)
      .single();

    if (error) {
      throw error;
    }

    return data as Level;
  } catch (error) {
    console.error("Error getting level by id", error);
    throw error;
  }
};

export const getChatsByUserId = async (userId: string): Promise<ChatWithParticipants[]> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select(`
        *,
        tutor:users!chats_tutor_id_fkey (*),
        student:users!chats_student_id_fkey (*)
      `)
      .or(`tutor_id.eq.${userId},student_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log("Chats data:", data);

    // Get last message for each chat and get unread count
    const processedData = await Promise.all(
      (data || []).map(async (chat) => {
        // Get last message
        const { data: lastMessageData } = await supabase
          .from("messages")
          .select("id, content, created_at, sender_id")
          .eq("chat_id", chat.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Determine if user is tutor or student and get unread count
        const isUserTutor = chat.tutor_id === userId;
        const unreadCount = isUserTutor ? chat.unread_count_tutor : chat.unread_count_student;

        return {
          ...chat,
          last_message: lastMessageData?.[0] || null,
          unread_count: unreadCount
        };
      })
    );

    return processedData as ChatWithParticipants[];
  } catch (error) {
    console.error("Error getting chats by user ID:", error);
    throw error;
  }
};

export const findChatBetweenUsers = async (
  tutorId: string, 
  studentId: string
): Promise<ChatWithParticipants | null> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select(`
        *,
        tutor:users!chats_tutor_id_fkey (*),
        student:users!chats_student_id_fkey (*)
      `)
      .eq("tutor_id", tutorId)
      .eq("student_id", studentId)
      .single();

    return data as ChatWithParticipants || null;
  } catch (error) {
    console.error("Error finding chat between users:", error);
    throw error;
  }
};

export const getChatMessagesByChatId = async (
  chatId: number
): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId);

    if (error) {
      throw error;
    }

    return data as ChatMessage[];
  } catch (error) {
    console.error("Error getting chat messages by chat ID:", error);
    throw error;
  }
};

export const getChatMessagesByChatIdAndPages = async (
  chatId: number,
  page: number,
  pageSize: number
): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false }) 
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      throw error;
    }

    return data as ChatMessage[];
  } catch (error) {
    console.error("Error getting chat messages by chat ID and pages:", error);
    throw error;
  }
};
