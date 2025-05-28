export interface TutorProfile {
        id: string,
        bio: string,
        hourly_rate: number
        is_published: boolean
}

export interface StudentProfile {
        id: string,
}

export interface UserProfile {
        id: string,
        first_name: string,
        last_name: string,
        location: string,
        role: "tutor" | "student"
        // profileDetails: TutorProfile | StudentProfile
}

export interface TutorSubject {
        id: string,
        tutor_id: string,
        subject_id: number,
        level_id: number
}

export interface Subject {
        id: number
        name: string
}

export interface Level {
        id: number
        name: string
}

export interface Review {
        id: number
        created_at: Date
        tutor_id: string,
        student_id: string,
        rating: number,
        description: string
}

export interface SubjectAndLevel {
        subject_id: number
        level_id: number
}

export interface TutorWithSubjectsAndLevels extends TutorProfile {
        subjects_and_levels: SubjectAndLevel[]
}