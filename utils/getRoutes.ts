import { supabase } from "./supabase";

export const getAllTutors = async () => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting all tutors:", error);
    throw error;
  }
};

export const getTutorsBySubject = async (subject: string) => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .eq("subject", subject);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting tutors by subject:", error);
    throw error;
  }
}

export const getTutorById = async (tutorId: string) => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .eq("id", tutorId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting tutor by ID:", error);
    throw error;
  }
}

export const getPageOfTutors = async (page: number, pageSize: number) => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting page of tutors:", error);
    throw error;
  }
}

export const getUserById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}