import { Chat, ChatMessage, Level, Review, StudentProfile, Subject, TutorProfile, TutorSubject, UserProfile } from "./models";
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

export const createChat = async (chat : Chat) => {
    try {
        const { data, error } = await supabase
            .from("chats")
            .insert(chat);

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
}

export const postChatMessage = async (message: ChatMessage) => {
    try {
        const { data, error } = await supabase
            .from("messages")
            .insert(message);

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error posting chat message:", error);
        throw error;
    }
}