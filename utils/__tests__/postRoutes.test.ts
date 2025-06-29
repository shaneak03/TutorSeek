import { findChatBetweenUsers } from "@/utils/getRoutes";
import { ChatMessage, ChatWithParticipants, UserProfile } from "@/utils/models";
import {
  addTutorSubjects,
  createTimeTable,
  deleteTutorSubjects,
  markMessagesAsRead,
  postChatMessage,
  postReview,
  updateLastSeen,
  updateRatingReview,
  updateTutorProfile,
  updateUserProfile,
} from "@/utils/postRoutes";
import { supabase } from "@/utils/supabase";

jest.mock("@/utils/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

jest.mock("@/utils/getRoutes", () => ({
  findChatBetweenUsers: jest.fn(),
}));

describe("Supabase API Post Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("postReview", () => {
    const reviewData = {
      student_id: "student123",
      tutor_id: "tutor123",
      rating: 5,
      description: "Great tutor!",
    };

    it("should successfully post review", async () => {
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await postReview(
        reviewData.student_id,
        reviewData.tutor_id,
        reviewData.rating,
        reviewData.description
      );

      expect(supabase.from).toHaveBeenCalledWith("reviews");
      expect(mockInsert).toHaveBeenCalledWith(reviewData);
    });

    it("should handle error when posting review", async () => {
      const mockError = new Error("Database error");
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(
        postReview(
          reviewData.student_id,
          reviewData.tutor_id,
          reviewData.rating,
          reviewData.description
        )
      ).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith(
        "Error posting review:",
        mockError
      );
    });
  });

  describe("createTimeTable", () => {
    it("should successfully create timetable", async () => {
      const tutorId = "tutor123";
      const mockCount = 8;

      const mockSelect = jest.fn().mockResolvedValue({
        count: mockCount,
        error: null,
      });

      const mockInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ insert: mockInsert });

      await createTimeTable(tutorId);

      expect(supabase.from).toHaveBeenCalledWith("timeslots");
      expect(supabase.from).toHaveBeenCalledWith("teaching_slots");
      expect(mockSelect).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });

      const expectedSlots = [];
      for (let d = 0; d < 7; d++) {
        for (let t_id = 1; t_id <= mockCount; t_id++) {
          expectedSlots.push({ tutor_id: tutorId, day: d, timeslot_id: t_id });
        }
      }
      expect(mockInsert).toHaveBeenCalledWith(expectedSlots);
    });

    it("should handle error when counting timeslots", async () => {
      const tutorId = "tutor123";
      const mockError = new Error("Database error");
      const mockSelect = jest.fn().mockResolvedValue({
        count: null,
        error: mockError,
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await createTimeTable(tutorId);

      expect(console.log).toHaveBeenCalledWith(
        "Error creating timetable" + mockError
      );
    });
  });

  describe("updateLastSeen", () => {
    const userId = "user123";

    it("should successfully update last seen timestamp", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await updateLastSeen(userId);

      expect(supabase.from).toHaveBeenCalledWith("users");
      expect(mockUpdate).toHaveBeenCalledWith({
        last_online_at: expect.any(String),
      });
      expect(console.log).toHaveBeenCalledWith(
        `Updated last_online_at for user ${userId}`
      );
    });

    it("should handle error when updating last seen", async () => {
      const mockError = new Error("Database error");
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await updateLastSeen(userId);

      expect(console.error).toHaveBeenCalledWith(
        "Failed to update last_online_at:",
        mockError
      );
    });
  });

  describe("updateUserProfile", () => {
    const mockUserProfile: UserProfile = {
      id: "user123",
      first_name: "John",
      last_name: "Doe",
      location: "Singapore",
      role: "student",
      email: "john.doe@example.com",
      profile_icon_url: "https://example.com/icon.jpg",
    };

    it("should successfully update user profile", async () => {
      const mockData = { id: "user123" };
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserProfile(mockUserProfile);

      expect(supabase.from).toHaveBeenCalledWith("users");
      expect(mockUpdate).toHaveBeenCalledWith(mockUserProfile);
      expect(result).toEqual(mockData);
    });

    it("should handle error when updating user profile", async () => {
      const mockError = new Error("Database error");
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await expect(updateUserProfile(mockUserProfile)).rejects.toThrow(
        "Database error"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error updating user profile:",
        mockError
      );
    });
  });

  describe("updateRatingReview", () => {
    const avgRating = 4.5;
    const reviewCount = 10;
    const tutorId = "tutor123";

    it("should successfully update rating and review count", async () => {
      const mockData = { id: tutorId };
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateRatingReview(avgRating, reviewCount, tutorId);

      expect(supabase.from).toHaveBeenCalledWith("tutors");
      expect(mockUpdate).toHaveBeenCalledWith({
        rating_count: avgRating,
        review_count: reviewCount,
      });
      expect(result).toEqual(mockData);
    });

    it("should handle error when updating rating and review", async () => {
      const mockError = new Error("Database error");
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await expect(
        updateRatingReview(avgRating, reviewCount, tutorId)
      ).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith(
        "Error updating rating and review count",
        mockError
      );
    });
  });

  describe("updateTutorProfile", () => {
    const mockTutorProfileData = {
      id: "tutor123",
      bio: "Updated bio",
      hourly_rate: 60,
      is_published: false,
      subjects: [],
    };

    it("should successfully update tutor profile", async () => {
      const mockData = { id: "tutor123" };
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateTutorProfile(mockTutorProfileData);

      expect(supabase.from).toHaveBeenCalledWith("tutors");
      expect(mockUpdate).toHaveBeenCalledWith({
        id: mockTutorProfileData.id,
        bio: mockTutorProfileData.bio,
        hourly_rate: mockTutorProfileData.hourly_rate,
        is_published: mockTutorProfileData.is_published,
      });
      expect(result).toEqual(mockData);
    });

    it("should handle error when updating tutor profile", async () => {
      const mockError = new Error("Database error");
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await expect(updateTutorProfile(mockTutorProfileData)).rejects.toThrow(
        "Database error"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error updating tutor profile:",
        mockError
      );
    });
  });

  describe("addTutorSubjects", () => {
    const tutorId = "tutor123";
    const subjects = [
      { id: 1, level: 1, subject: 1 },
      { id: 2, level: 2, subject: 3 },
    ];

    it("should successfully add tutor subjects", async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await addTutorSubjects(subjects, tutorId);

      expect(supabase.from).toHaveBeenCalledWith("tutor_subjects");
      expect(mockInsert).toHaveBeenCalledWith([
        { subject_id: 1, level_id: 1, tutor_id: tutorId },
        { subject_id: 3, level_id: 2, tutor_id: tutorId },
      ]);
      expect(result).toEqual(mockData);
    });

    it("should handle error when adding tutor subjects", async () => {
      const mockError = new Error("Database error");
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(addTutorSubjects(subjects, tutorId)).rejects.toThrow(
        "Database error"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error adding tutor subjects",
        mockError
      );
    });
  });

  describe("deleteTutorSubjects", () => {
    const ids = [1, 2, 3];
    const tutorId = "tutor123";

    it("should successfully delete tutor subjects", async () => {
      const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const mockDelete = jest.fn().mockReturnValue({
        in: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      const result = await deleteTutorSubjects(ids, tutorId);

      expect(supabase.from).toHaveBeenCalledWith("tutor_subjects");
      expect(mockDelete).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should handle error when deleting tutor subjects", async () => {
      const mockError = new Error("Database error");
      const mockDelete = jest.fn().mockReturnValue({
        in: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      await expect(deleteTutorSubjects(ids, tutorId)).rejects.toThrow(
        "Database error"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error removing tutor subjects",
        mockError
      );
    });
  });

  describe("markMessagesAsRead", () => {
    const chatId = 1;
    const userId = "tutor123";

    it("should successfully mark messages as read for tutor", async () => {
      const mockChatData = { tutor_id: userId };
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChatData, error: null }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      await markMessagesAsRead(chatId, userId);

      expect(supabase.from).toHaveBeenCalledWith("chats");
      expect(supabase.rpc).toHaveBeenCalledWith("mark_messages_read", {
        chat_id_param: chatId,
        user_id_param: userId,
        field_name: "unread_count_tutor",
      });
    });

    it("should successfully mark messages as read for student", async () => {
      const studentId = "student123";
      const mockChatData = { tutor_id: "different_tutor" };
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockChatData, error: null }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      await markMessagesAsRead(chatId, studentId);

      expect(supabase.rpc).toHaveBeenCalledWith("mark_messages_read", {
        chat_id_param: chatId,
        user_id_param: studentId,
        field_name: "unread_count_student",
      });
    });

    it("should handle error when chat not found", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(markMessagesAsRead(chatId, userId)).rejects.toThrow(
        "Chat not found"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error marking messages as read:",
        expect.any(Error)
      );
    });

    it("should handle database error when fetching chat", async () => {
      const mockError = new Error("Database error");
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(markMessagesAsRead(chatId, userId)).rejects.toThrow(
        "Database error"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error marking messages as read:",
        mockError
      );
    });
  });

  describe("postChatMessage", () => {
    const mockMessageData = {
      sender_id: "user123",
      recipient_id: "user456",
      content: "Hello there!",
    };
    const senderRole = "student";
    const tutorId = "tutor123";
    const studentId = "student123";

    const mockExistingChat: ChatWithParticipants = {
      id: 1,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      tutor_id: tutorId,
      student_id: studentId,
      unread_count_tutor: 0,
      unread_count_student: 0,
      tutor: {
        id: tutorId,
        first_name: "Jane",
        last_name: "Smith",
        location: "Singapore",
        role: "tutor",
        email: "jane@example.com",
        profile_icon_url: "https://example.com/jane.jpg",
      },
      student: {
        id: studentId,
        first_name: "John",
        last_name: "Doe",
        location: "Singapore",
        role: "student",
        email: "john@example.com",
        profile_icon_url: "https://example.com/john.jpg",
      },
    };

    beforeEach(() => {
      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValue("2025-01-01T00:00:00.000Z");
    });

    it("should post message to existing chat", async () => {
      const mockMessage: ChatMessage = {
        id: 1,
        created_at: "2025-01-01T00:00:00.000Z",
        sender_id: mockMessageData.sender_id,
        recipient_id: mockMessageData.recipient_id,
        content: mockMessageData.content,
        chat_id: 1,
        read: false,
      };

      (findChatBetweenUsers as jest.Mock).mockResolvedValue(mockExistingChat);

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockMessage, error: null }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await postChatMessage(
        mockMessageData,
        senderRole,
        tutorId,
        studentId
      );

      expect(findChatBetweenUsers).toHaveBeenCalledWith(tutorId, studentId);
      expect(supabase.from).toHaveBeenCalledWith("messages");
      expect(supabase.rpc).toHaveBeenCalledWith("increment_unread_count", {
        chat_id_param: mockExistingChat.id,
        field_name: "unread_count_tutor",
      });
      expect(result).toEqual({
        message: mockMessage,
        chat: mockExistingChat,
        wasNewChat: false,
      });
    });

    it("should create new chat and post message when no existing chat", async () => {
      const mockNewChat: ChatWithParticipants = {
        ...mockExistingChat,
        id: 2,
      };
      const mockMessage: ChatMessage = {
        id: 1,
        created_at: "2025-01-01T00:00:00.000Z",
        sender_id: mockMessageData.sender_id,
        recipient_id: mockMessageData.recipient_id,
        content: mockMessageData.content,
        chat_id: 2,
        read: false,
      };

      (findChatBetweenUsers as jest.Mock).mockResolvedValue(null);

      const mockChatInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockNewChat, error: null }),
        }),
      });

      const mockMessageInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockMessage, error: null }),
        }),
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ insert: mockChatInsert })
        .mockReturnValueOnce({ insert: mockMessageInsert });

      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await postChatMessage(
        mockMessageData,
        senderRole,
        tutorId,
        studentId
      );

      expect(findChatBetweenUsers).toHaveBeenCalledWith(tutorId, studentId);
      expect(supabase.from).toHaveBeenCalledWith("chats");
      expect(supabase.from).toHaveBeenCalledWith("messages");
      expect(result).toEqual({
        message: mockMessage,
        chat: mockNewChat,
        wasNewChat: true,
      });
    });

    it("should handle error when posting chat message", async () => {
      const mockError = new Error("Database error");
      (findChatBetweenUsers as jest.Mock).mockResolvedValue(mockExistingChat);

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(
        postChatMessage(mockMessageData, senderRole, tutorId, studentId)
      ).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith(
        "Error posting chat message:",
        mockError
      );
    });
  });
});
