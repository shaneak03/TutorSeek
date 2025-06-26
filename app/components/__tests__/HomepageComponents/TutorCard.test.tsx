// TutorCard.test.tsx
import { render } from "@testing-library/react-native";
import React from "react";
import TutorCard, { tutorCardData } from "../../TutorCard";

const mockTutor: tutorCardData = {
  tutor_id: "123",
  first_name: "John",
  last_name: "Doe",
  hourly_rate: 50,
  profile_icon_url: "https://example.com/avatar.jpg",
  bio: "Experienced math tutor",
  rating_count: 4.75,
  review_count: 12,
  is_published: true,
  last_online_at: "2023-12-01T12:00:00Z",
};

jest.spyOn(console, "error").mockImplementation(msg => {
  if (msg.includes("An update to Icon inside a test")) return;
});

describe("TutorCard", () => {
  it("renders tutor name and rate correctly", () => {
    const { getByText } = render(<TutorCard tutor={mockTutor} />);

    // Check for name
    expect(getByText("John Doe")).toBeTruthy();

    // Check for hourly rate
    expect(getByText("SGD 50")).toBeTruthy();

    // Check for rating and review count
    expect(getByText("4.75")).toBeTruthy();
    expect(getByText("12 reviews")).toBeTruthy();
  });

  it("shows 0.00 and '0 reviews' when no rating/review", () => {
    const emptyTutor = { ...mockTutor, rating_count: 0, review_count: 0 };
    const { getByText } = render(<TutorCard tutor={emptyTutor} />);

    expect(getByText("0.00")).toBeTruthy();
    expect(getByText("0 reviews")).toBeTruthy();
  });

  it("renders singular review when count is 1", () => {
    const oneReviewTutor = { ...mockTutor, review_count: 1 };
    const { getByText } = render(<TutorCard tutor={oneReviewTutor} />);

    expect(getByText("1 review")).toBeTruthy();
  });
});
