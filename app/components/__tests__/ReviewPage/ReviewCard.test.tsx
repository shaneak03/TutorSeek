import { render } from "@testing-library/react-native";
import React from "react";
import ReviewCard, { ReviewData } from "../../ReviewCard";

jest.mock("@expo/vector-icons", () => {
  return {
    AntDesign: "AntDesign",
    Entypo: "Entypo",
  };
});

const mockReview: ReviewData = {
  id: 1,
  tutor_id: "t1",
  student_id: "s1",
  rating: 4.5,
  description: "Great tutor, helped me a lot!",
  created_at: "2023-05-20T12:00:00Z",
  first_name: "Alice",
  last_name: "Smith",
  profile_icon_url: "https://example.com/avatar.jpg",
};

describe("ReviewCard", () => {
  it("renders correctly with rounded = false (default)", () => {
    const { getByText } = render(<ReviewCard review={mockReview} />);

    // Check name with last initial and period
    expect(getByText("Alice S.")).toBeTruthy();

    // Check formatted date: "20 May 2023"
    expect(getByText("20 May 2023")).toBeTruthy();

    // Here just check the description text is present
    expect(getByText("Great tutor, helped me a lot!")).toBeTruthy();
  });

  it("renders correctly with rounded = true", () => {
    const { getByText } = render(
      <ReviewCard review={mockReview} rounded={true} />
    );

    expect(getByText("Alice S.")).toBeTruthy();
  });
});
