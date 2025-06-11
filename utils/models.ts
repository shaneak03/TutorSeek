export interface TutorProfile {
  id: string;
  bio: string;
  hourly_rate: number;
  is_published: boolean;
}

export interface StudentProfile {
  id: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  location: string;
  role: "tutor" | "student";
  email: string;
  profile_icon_url: string;
  // profileDetails: TutorProfile | StudentProfile
}

export interface TutorSubject {
  id: string;
  tutor_id: string;
  subject_id: number;
  level_id: number;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Level {
  id: number;
  name: string;
}

export interface Review {
  id: number;
  created_at: string;
  tutor_id: string;
  student_id: string;
  rating: number;
  description: string;
}

export interface SubjectAndLevel {
  subject_id: number;
  level_id: number;
}

export interface TutorWithSubjectsAndLevels extends TutorProfile {
  subjects_and_levels: SubjectAndLevel[];
}

export interface ChatMessage {
  id: number;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  chat_id: number;
  read: boolean;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    profile_icon_url: string;
    role: "tutor" | "student";
  };
}

export interface ChatData {
  id: number;
  created_at: string;
  updated_at: string;
  tutor_id: string;
  student_id: string;
  unread_count_tutor: number;
  unread_count_student: number;
}

export interface ChatWithParticipants extends ChatData {
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    profile_icon_url: string;
    email: string;
    location: string;
  };
  student: {
    id: string;
    first_name: string;
    last_name: string;
    profile_icon_url: string;
    email: string;
    location: string;
  };
  last_message?: {
    id: number;
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}
