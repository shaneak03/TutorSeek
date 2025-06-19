import { TutorProfileData } from "@/app/(tabs)/(profile)";
import {
  Chat,
  ChatMessage,
  Review,
  StudentProfile,
  TutorProfile,
  UserProfile,
} from "./models";
import { supabase } from "./supabase";

export const postUserProfile = async (profile: UserProfile) => {
  try {
    const { data, error } = await supabase.from("users").insert(profile);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error posting user profile:", error);
    throw error;
  }
};

export const postTutorProfile = async (profile: TutorProfile) => {
  try {
    const { data, error } = await supabase.from("tutors").insert(profile);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error posting tutor profile:", error);
    throw error;
  }
};

export const postStudentProfile = async (profile: StudentProfile) => {
  try {
    const { data, error } = await supabase.from("students").insert(profile);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error posting student profile:", error);
    throw error;
  }
};

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

export const updateStudentProfile = async (profile: StudentProfile) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .update(profile)
      .eq("id", profile.id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating student profile:", error);
    throw error;
  }
};

export const postReview = async (review: Review) => {
  try {
    const { data, error } = await supabase.from("reviews").insert(review);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error posting review:", error);
    throw error;
  }
};

export const postTutorSubject = async (
  tutor_id: string,
  subject_id: number,
  level_id: number
) => {
  {
    try {
      const { data, error } = await supabase
        .from("tutor_subjects")
        .insert({ tutor_id, subject_id, level_id });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error posting tutor subject:", error);
      throw error;
    }
  }
};

export const createChat = async (chat: Chat) => {
  try {
    const { data, error } = await supabase.from("chats").insert(chat);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const postChatMessage = async (message: ChatMessage) => {
  try {
    const { data, error } = await supabase.from("messages").insert(message);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error posting chat message:", error);
    throw error;
  }
};
