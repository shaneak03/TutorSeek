import { Level, Review, Subject, TutorProfile, TutorSubject, UserProfile } from "./models";
import { supabase } from "./supabase";

export const getAllTutors = async (): Promise<TutorProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*");

    if (error) {
      throw error;
    }

    return data as TutorProfile[];
  } catch (error) {
    console.error("Error getting all tutors:", error);
    throw error;
  }
};

export const getTutorsBySubject = async (subject_id : number) : Promise<TutorProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*, tutor_subjects!inner(*)")
      .eq("tutor_subjects.subject_id", subject_id);

    if (error) {
      throw error;
    }

    return data as TutorProfile[];

  } catch (error) {
    console.error("Error getting tutors by subject:", error);
    throw error;
  }
}

export const getTutorsByLevel = async (level_id : number) : Promise<TutorProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*, tutor_subjects!inner(*)")
      .eq("tutor_subjects.level_id", level_id);

    if (error) {
      throw error;
    }

    return data as TutorProfile[];

  } catch (error) {
    console.error("Error getting tutors by level:", error);
    throw error;
  }
}

export const getTutorsBySubjectAndLevel = async (subject_id: number, level_id : number) : Promise<TutorProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*, tutor_subjects!inner(*)")
      .eq("tutor_subjects.subject_id", subject_id)
      .eq("tutor_subjects.level_id", level_id);

    if (error) {
      throw error;
    }

    return data as TutorProfile[];

  } catch (error) {
    console.error("Error getting tutors by level:", error);
    throw error;
  }
}


export const getSubjectsByTutorId = async (tutor_id : string) : Promise<TutorSubject[]> => {
  try {
    const { data, error } = await supabase
      .from("tutor_subjects")
      .select("*")
      .eq("tutor_id", tutor_id);

    if (error) {
      throw error;
    }

    return data as TutorSubject[];

  } catch (error) {
    console.error("Error getting tutor subjects:", error);
    throw error;
  }
}

export const getTutorById = async (tutorId : string) : Promise<TutorProfile> => {
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
}

export const getPageOfTutors = async (page : number, pageSize : number) : Promise<TutorProfile[]> => {
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
}

export const getUserById = async (userId : string) : Promise<UserProfile> => {
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
}

export const getLevels = async (): Promise<Level[]> => {
  try {
    const { data, error } = await supabase
      .from("levels")
      .select("*");
    
    if (error) {
      throw error;
    }

    return data as Level[];

  } catch (error) {
    console.error("Error getting levels:", error);
    throw error;
  }
}

export const getSubjects = async () : Promise<Subject[]> => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*");
    
    if (error) {
      throw error;
    }

    return data as Subject[];
    
  } catch (error) {
    console.error("Error getting subjects:", error)
    throw error;
  }
}

export const getReviewsByStudentId = async (studentId : string) : Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("student_id", studentId)

    if (error) {
      throw error;
    }

    return data as Review[]; 

  } catch (error) {
    console.error("Error getting reviews by student id", error);
    throw error;
  }
}

export const getReviewsByTutorId = async (tutorId : string) : Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("tutor_id", tutorId)

    if (error) {
      throw error;
    }

    return data as Review[]; 

  } catch (error) {
    console.error("Error getting reviews by tutor id", error);
    throw error;
  }
}

export const getSubjectById = async (subjectId : string) : Promise<Subject> => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single()

    if (error) {
      throw error;
    }

    return data as Subject; 

  } catch (error) {
    console.error("Error getting subject by id", error);
    throw error;
  }
}

export const getLevelById = async (levelId : string) : Promise<Level> => {
  try {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .eq("id", levelId)
      .single()

    if (error) {
      throw error;
    }

    return data as Level; 

  } catch (error) {
    console.error("Error getting level by id", error);
    throw error;
  }
}