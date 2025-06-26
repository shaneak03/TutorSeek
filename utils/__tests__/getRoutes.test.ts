import { filterOptions } from "@/app/components/HomeTopNav";
import {
  findChatBetweenUsers,
  getAvgRatingAndReviewCount,
  getChatMessagesByChatId,
  getChatMessagesByChatIdAndPages,
  getChatsByUserId,
  getLevelById,
  getLevels,
  getPageOfTutors,
  getReviewsByStudentId,
  getReviewsByTutorId,
  getStudentById,
  getSubjectById,
  getSubjects,
  getSubjectsByTutorId,
  getTutor,
  getTutorById,
  getTutors,
  getUserById
} from "@/utils/getRoutes";
import {
  ChatMessage,
  ChatWithParticipants,
  Level,
  Review,
  StudentProfile,
  Subject,
  TutorProfile,
  UserProfile,
} from "@/utils/models";
import { supabase } from "@/utils/supabase";

jest.mock("@/utils/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
  },
}));

describe("Supabase API Get Functions", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockTutorProfile = (id: string): TutorProfile => ({
    id,
    bio: `Bio for tutor ${id}`,
    hourly_rate: 50 + parseInt(id),
    is_published: true,
  });

  const createMockUserProfile = (id: string, role: "tutor" | "student"): UserProfile => ({
    id,
    first_name: `User${id}`,
    last_name: `Last${id}`,
    location: "New York",
    role,
    email: `user${id}@example.com`,
    profile_icon_url: `http://example.com/icon${id}.jpg`,
    last_online_at: new Date().toISOString(),
  });

  const createMockStudentProfile = (id: string): StudentProfile => ({
    id,
  });

  const createMockSubject = (id: number): Subject => ({
    id,
    name: `Subject ${id}`,
  });

  const createMockLevel = (id: number): Level => ({
    id,
    name: `Level ${id}`,
  });

  const createMockReview = (id: number, tutorId: string, studentId: string): Review => ({
    id,
    created_at: new Date().toISOString(),
    tutor_id: tutorId,
    student_id: studentId,
    rating: 4 + (id % 2),
    description: `Review ${id}`,
  });

  const createMockChatMessage = (id: number, chatId: number, senderId: string): ChatMessage => ({
    id,
    created_at: new Date().toISOString(),
    sender_id: senderId,
    recipient_id: senderId === "tutor1" ? "student1" : "tutor1",
    content: `Message ${id}`,
    chat_id: chatId,
    read: false,
  });

  const createMockChatWithParticipants = (id: number, tutorId: string, studentId: string): ChatWithParticipants => ({
    id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tutor_id: tutorId,
    student_id: studentId,
    unread_count_tutor: 0,
    unread_count_student: 0,
    tutor: createMockUserProfile(tutorId, "tutor"),
    student: createMockUserProfile(studentId, "student"),
    last_message: {
      id: 1,
      content: `Message 1`,
      created_at: new Date().toISOString(),
      sender_id: tutorId,
    },
  });

  describe("getTutors", () => {
    it("should fetch tutors with default filters", async () => {
      const mockData = [
        { tutor_id: "tutor1", hourly_rate: 50, rating_count: 5 },
        { tutor_id: "tutor2", hourly_rate: 60, rating_count: 4 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const filters = {
        minPrice: 0,
        maxPrice: 100,
        subject: 0,
        level: 0,
        rating: 0,
        sortBy: "rating_desc",
      };

      const result = await getTutors(filters as filterOptions);

      expect(supabase.from).toHaveBeenCalledWith("tutor_distinct");
      expect(result).toEqual(mockData);
    });

    it("should apply filters when provided", async () => {
      const mockData = [
        { tutor_id: "tutor1", hourly_rate: 50, rating_count: 5 },
        { tutor_id: "tutor2", hourly_rate: 60, rating_count: 4 }
      ];

      const mockTutorsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        then: function (resolve: any) {
          return Promise.resolve(resolve({ data: mockData, error: null }));
        }
      };

      (supabase.from as jest.Mock).mockReturnValue(mockTutorsQuery);

      const filters = {
        minPrice: 40,
        maxPrice: 60,
        subject: 1,
        level: 1,
        rating: 4,
        sortBy: "price_asc",
      };

      const result = await getTutors(filters as filterOptions);

      expect(supabase.from).toHaveBeenCalledWith("tutor_distinct");
      expect(mockTutorsQuery.gte).toHaveBeenCalledWith("hourly_rate", 40);
      expect(mockTutorsQuery.lte).toHaveBeenCalledWith("hourly_rate", 60);
      expect(mockTutorsQuery.eq).toHaveBeenCalledWith("subject_id", 1);
      expect(mockTutorsQuery.eq).toHaveBeenCalledWith("level_id", 1);
      expect(mockTutorsQuery.gte).toHaveBeenCalledWith("rating_count", 4);
      expect(result).toEqual(mockData);
    });

    it("should return empty array on error", async () => {
      const mockTutorsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: new Error("Failed") })
      };

      (supabase.from as jest.Mock).mockReturnValue(mockTutorsQuery);

      const result = await getTutors({
        minPrice: 0,
        maxPrice: 100,
        subject: 0,
        level: 0,
        rating: 0,
        sortBy: "rating_desc",
      });

      expect(result).toEqual([]);
    });
  });

  describe("getTutor", () => {
    it("should fetch a single tutor with user data and return tutorCardData", async () => {
      const mockTutorResponse = {
        data: {
          id: "1",
          bio: "Test bio",
          hourly_rate: 50,
          is_published: true,
          users: {
            first_name: "John",
            last_name: "Doe",
            profile_icon_url: "url",
            last_online_at: "2025-01-01",
          }
        },
        error: null
      };

      const mockTutorQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockTutorResponse)
      };

      (supabase.from as jest.Mock).mockImplementation(() => mockTutorQuery);

      const result = await getTutor("1");

      expect(supabase.from).toHaveBeenCalledWith("tutors");
      expect(mockTutorQuery.select).toHaveBeenCalledWith(
        `*,
      users (
        first_name,
        last_name,
        profile_icon_url,
        last_online_at
      )`
      );
      expect(mockTutorQuery.eq).toHaveBeenCalledWith("id", "1");
      
      expect(result).toEqual({
        id: "1",
        tutor_id: "1",
        bio: "Test bio",
        hourly_rate: 50,
        is_published: true,
        first_name: "John",
        last_name: "Doe",
        profile_icon_url: "url",
        last_online_at: "2025-01-01"
      });
    });

    it("should throw an error when the query fails", async () => {
      const mockError = new Error("Failed to fetch tutor");
      const mockTutorQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError })
      };

      (supabase.from as jest.Mock).mockImplementation(() => mockTutorQuery);

      await expect(getTutor("1")).rejects.toThrow("Failed to fetch tutor");
    });
  });

  describe('getSubjectsByTutorId', () => {
    it('should fetch subjects for a tutor', async () => {
      const mockSubjects = [
        { subject: 'Mathematics', level: 'PSLE', id: 1 },
        { subject: 'Science', level: 'O-Level', id: 2 }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockSubjects, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getSubjectsByTutorId('tutor1');

      expect(supabase.from).toHaveBeenCalledWith('tutor_subjects_flatten');
      expect(mockQuery.select).toHaveBeenCalledWith('subject, level, id');
      expect(mockQuery.eq).toHaveBeenCalledWith('tutor_id', 'tutor1');
      expect(mockQuery.order).toHaveBeenCalledWith('level');
      expect(result).toEqual(mockSubjects);
    });

    it('should throw error when query fails', async () => {
      const mockError = new Error('Failed to fetch subjects');
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      await expect(getSubjectsByTutorId('tutor1')).rejects.toThrow('Failed to fetch subjects');
    });
  });

  describe("getTutorById", () => {
    it("should fetch tutor profile by ID and return TutorProfile", async () => {
      const mockTutor: TutorProfile = createMockTutorProfile("1");
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTutor, error: null }),
      });

      const result = await getTutorById("1");

      expect(result).toEqual(mockTutor);
    });
  });

  describe('getPageOfTutors', () => {
    it('should fetch a page of tutors with correct range', async () => {
      const mockTutors = [
        createMockTutorProfile('1'),
        createMockTutorProfile('2')
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockTutors, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getPageOfTutors(2, 10);

      expect(supabase.from).toHaveBeenCalledWith('tutors');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
      expect(result).toEqual(mockTutors);
    });

    it('should return empty array on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await getPageOfTutors(1, 10);
      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("should fetch user by ID and return UserProfile", async () => {
      const mockUser: UserProfile = createMockUserProfile("1", "tutor");
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      });

      const result = await getUserById("1");

      expect(result).toEqual(mockUser);
    });
  });

  describe("getStudentById", () => {
    it("should fetch student by ID and return StudentProfile", async () => {
      const mockStudent: StudentProfile = createMockStudentProfile("1");
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockStudent, error: null }),
      });

      const result = await getStudentById("1");

      expect(result).toEqual(mockStudent);
    });
  });

  describe("getLevels", () => {
    it("should fetch all levels and return Level[]", async () => {
      const mockLevels: Level[] = [
        createMockLevel(1),
        createMockLevel(2),
      ];

      const mockLevelsQuery = {
        select: jest.fn().mockResolvedValue({
          data: mockLevels,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockLevelsQuery);

      const result = await getLevels();

      expect(supabase.from).toHaveBeenCalledWith("levels");
      expect(mockLevelsQuery.select).toHaveBeenCalledWith("*");
      expect(result).toEqual(mockLevels);
    });
  });

  describe("getSubjects", () => {
    it("should fetch all subjects and return Subject[]", async () => {
      const mockSubjects: Subject[] = [
        createMockSubject(1),
        createMockSubject(2),
      ];

      const mockSubjectsQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockSubjects,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockSubjectsQuery);

      const result = await getSubjects();

      expect(supabase.from).toHaveBeenCalledWith("subjects");
      expect(mockSubjectsQuery.select).toHaveBeenCalledWith("*");
      expect(mockSubjectsQuery.order).toHaveBeenCalledWith("id");
      expect(result).toEqual(mockSubjects);
    });
  });

  describe('getSubjectById', () => {
    it('should fetch subject by ID', async () => {
      const mockSubject = createMockSubject(1);
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSubject, error: null }),
      });

      const result = await getSubjectById('1');
      expect(result).toEqual(mockSubject);
    });
  });

  describe('getLevelById', () => {
    it('should fetch level by ID', async () => {
      const mockLevel = createMockLevel(1);
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockLevel, error: null }),
      });

      const result = await getLevelById('1');
      expect(result).toEqual(mockLevel);
    });
  });

  describe('getReviewsByStudentId', () => {
    it('should fetch and transform reviews for a student', async () => {
      const mockReviews = [
        {
          id: 1,
          tutor_id: 'tutor1',
          student_id: 'student1',
          rating: 5,
          description: 'Great Tutor',
          students: {
            users: {
              first_name: 'Student',
              last_name: 'One',
              profile_icon_url: 'student1.jpg'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockReviews, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getReviewsByStudentId('student1');

      expect(supabase.from).toHaveBeenCalledWith('reviews');
      expect(mockQuery.select).toHaveBeenCalledWith(expect.stringContaining(
        `*, 
        students (
          users (
            first_name,
            last_name,
            profile_icon_url
          )
        )`
      ));
      expect(result).toEqual([{
        ...mockReviews[0],
        first_name: 'Student',
        last_name: 'One',
        profile_icon_url: 'student1.jpg'
      }]);
    });
  });

  describe("getReviewsByTutorId", () => {
    it("should fetch reviews for a tutor and return Review[]", async () => {
      const mockReviews = [
        {
          ...createMockReview(1, "tutor1", "student1"),
          students: {
            users: {
              first_name: "Student",
              last_name: "One",
              profile_icon_url: "student1.jpg",
            },
          },
        },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockReviews,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockImplementation(() => mockQueryBuilder);

      const result = await getReviewsByTutorId("tutor1");

      expect(supabase.from).toHaveBeenCalledWith("reviews");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(expect.stringContaining(
        `*, 
        students (
          users (
            first_name,
            last_name,
            profile_icon_url
          )
        )`));
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("tutor_id", "tutor1");

      expect(result).toEqual([
        {
          ...mockReviews[0],
          first_name: "Student",
          last_name: "One",
          profile_icon_url: "student1.jpg",
        },
      ]);
    });
  });

  describe('getAvgRatingAndReviewCount', () => {
    it('should call RPC function and return correct data', async () => {
      const mockData = { avg_rating: 4.5, review_count: 10 };
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: [mockData], error: null });

      const result = await getAvgRatingAndReviewCount('tutor1');

      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_avg_rating_and_review_count',
        { tutorid: 'tutor1' }
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error when RPC fails', async () => {
      const mockError = new Error('RPC failed');
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await expect(getAvgRatingAndReviewCount('tutor1')).rejects.toThrow('RPC failed');
    });
  });

  describe("getChatsByUserId", () => {
    it("should fetch chats for a user and return ChatWithParticipants[]", async () => {
      const userId = "tutor1";
      const mockChat = createMockChatWithParticipants(1, userId, "student1");
      const mockLastMessage = createMockChatMessage(1, 1, userId);

      const mockChatsQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockChat],
          error: null,
        }),
      };

      const mockMessagesQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [mockLastMessage],
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => mockChatsQuery) 
        .mockImplementationOnce(() => mockMessagesQuery);

      const result = await getChatsByUserId(userId);

      expect(supabase.from).toHaveBeenCalledWith("chats");
      expect(mockChatsQuery.select).toHaveBeenCalledWith(expect.stringContaining(
        `*,
        tutor:users!chats_tutor_id_fkey (*),
        student:users!chats_student_id_fkey (*)`
      ));
      
      expect(mockChatsQuery.or).toHaveBeenCalledWith(`tutor_id.eq.${userId},student_id.eq.${userId}`);
      expect(mockChatsQuery.order).toHaveBeenCalledWith("updated_at", { ascending: false });

      expect(supabase.from).toHaveBeenCalledWith("messages");
      expect(mockMessagesQuery.select).toHaveBeenCalledWith("id, content, created_at, sender_id");
      expect(mockMessagesQuery.eq).toHaveBeenCalledWith("chat_id", mockChat.id);
      expect(mockMessagesQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockMessagesQuery.limit).toHaveBeenCalledWith(1);

      expect(result).toEqual([{
        ...mockChat,
        last_message: {
          id: mockLastMessage.id,
          content: mockLastMessage.content,
          created_at: mockLastMessage.created_at,
          sender_id: mockLastMessage.sender_id,
          chat_id: mockLastMessage.chat_id,
          read: mockLastMessage.read,
          recipient_id: mockLastMessage.recipient_id
        },
        unread_count: mockChat.unread_count_tutor, 
      }]);
    });

    it("should handle empty chat list", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await getChatsByUserId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getChatMessagesByChatId", () => {
    it("should fetch messages for a chat and return ChatMessage[]", async () => {
      const mockMessages = [
        createMockChatMessage(1, 1, "tutor1"),
        createMockChatMessage(2, 1, "student1"),
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };

      (supabase.from as jest.Mock).mockImplementation(() => mockQueryBuilder);

      const result = await getChatMessagesByChatId(1);

      expect(supabase.from).toHaveBeenCalledWith("messages");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("chat_id", 1);
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getChatMessagesByChatIdAndPages', () => {
    it('should fetch paginated messages for a chat', async () => {
      const mockMessages = [
        createMockChatMessage(1, 1, 'user1'),
        createMockChatMessage(2, 1, 'user2')
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getChatMessagesByChatIdAndPages(1, 2, 10);

      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('chat_id', 1);
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
      expect(result).toEqual(mockMessages);
    });
  });

  describe("findChatBetweenUsers", () => {
    it("should find chat between tutor and student and return ChatWithParticipants", async () => {
      const mockChat = createMockChatWithParticipants(1, "tutor1", "student1");
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockChat, error: null }),
      });

      const result = await findChatBetweenUsers("tutor1", "student1");

      expect(result).toEqual(mockChat);
    });

    it("should return null if no chat found", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await findChatBetweenUsers("tutor1", "student1");

      expect(result).toBeNull();
    });
  });
});