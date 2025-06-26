import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import TutorSubjectList from "../../TutorSubjectList"; // adjust path if needed

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(msg => {
    if (msg.includes("not wrapped in act")) {
      return;
    }
    console.error(msg);
  });
});

describe("TutorSubjectList", () => {
  const mockSetTutorData = jest.fn();
  const mockSetSubsToDel = jest.fn();

  const sampleData = {
    id: "",
    subjects: [
      { id: 101, subject: "Math", level: "O-level" },
      { id: 102, subject: "English", level: "PSLE" },
    ],
    bio: "",
    hourly_rate: 123,
    is_published: false,
  };

  beforeEach(() => {
    mockSetTutorData.mockClear();
    mockSetSubsToDel.mockClear();
  });

  it("renders fallback text when no subjects are present", () => {
    const { getByText } = render(
      <TutorSubjectList
        tutorData={{ ...sampleData, subjects: [] }}
        setTutorData={mockSetTutorData}
        setSubsToDel={mockSetSubsToDel}
      />
    );

    expect(getByText("No subjects")).toBeTruthy();
  });

  it("renders all subjects", () => {
    const { getByText } = render(
      <TutorSubjectList
        tutorData={sampleData}
        setTutorData={mockSetTutorData}
        setSubsToDel={mockSetSubsToDel}
      />
    );

    expect(getByText("O-level Math")).toBeTruthy();
    expect(getByText("PSLE English")).toBeTruthy();
  });

  it("calls onDeleteSubject when delete button is pressed", () => {
    const { getAllByRole } = render(
      <TutorSubjectList
        tutorData={sampleData}
        setTutorData={mockSetTutorData}
        setSubsToDel={mockSetSubsToDel}
        isEditing={true}
      />
    );

    const deleteButtons = getAllByRole("button");
    fireEvent.press(deleteButtons[0]);

    expect(mockSetTutorData).toHaveBeenCalled();
  });
});
