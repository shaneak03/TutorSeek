import { supabase } from "./supabase";

export const getAllTutors = async () => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*");

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
      .select("*, tutor_subjects!inner(*)")
      .eq("tutor_subjects.subject", subject);

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

export const getLevels = async () => {
  try {
    const { data, error } = await supabase
      .from("levels")
      .select("*");
    
    if (error) {
      throw error;
    }

    return data;

  } catch (error) {
    console.error("Error getting levels:", error);
    throw error;
  }
}

export const getSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*");
    
    if (error) {
      throw error;
    }

    return data;
    
  } catch (error) {
    console.error("Error getting subjects:", error)
    throw error;
  }
}

export const getReviewsByStudentId = async (studentId : string) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("student_id", studentId)

    if (error) {
      throw error;
    }

    return data; 

  } catch (error) {
    console.error("Error getting reviews by student id", error);
    throw error;
  }
}

export const getReviewsByTutorId = async (tutorId : string) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("tutor_id", tutorId)

    if (error) {
      throw error;
    }

    return data; 

  } catch (error) {
    console.error("Error getting reviews by tutor id", error);
    throw error;
  }
}

export const getSubjectById = async (subjectId : string) => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single()

    if (error) {
      throw error;
    }

    return data; 

  } catch (error) {
    console.error("Error getting subject by id", error);
    throw error;
  }
}

export const getLevelById = async (levelId : string) => {
  try {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .eq("id", levelId)
      .single()

    if (error) {
      throw error;
    }

    return data; 

  } catch (error) {
    console.error("Error getting level by id", error);
    throw error;
  }
}