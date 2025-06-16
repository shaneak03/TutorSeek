import { filterOptions } from "../app/components/HomeTopNav";
import {
  Chat,
  ChatMessage,
  Level,
  Review,
  StudentProfile,
  Subject,
  TutorProfile,
  UserProfile,
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

export const getReviewsByStudentId = async (
  studentId: string
): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("student_id", studentId);

    if (error) {
      throw error;
    }

    return data as Review[];
  } catch (error) {
    console.error("Error getting reviews by student id", error);
    throw error;
  }
};

export const getReviewPreview = async (tutorId: string) => {
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
      .eq("tutor_id", tutorId)
      .limit(4);

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
    console.error("Error getting review preview", error);
    throw error;
  }
};

export const getReviewsByTutorId = async (
  tutorId: string
): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("tutor_id", tutorId);

    if (error) {
      throw error;
    }

    return data as Review[];
  } catch (error) {
    console.error("Error getting reviews by tutor id", error);
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

export const getChatsByUserId = async (userId: string): Promise<Chat[]> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`tutor_id.eq.${userId},student_id.eq.${userId}`);

    if (error) {
      throw error;
    }

    return data as Chat[];
  } catch (error) {
    console.error("Error getting chat by ID:", error);
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
