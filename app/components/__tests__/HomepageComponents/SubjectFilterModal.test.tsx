import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { filterOptions } from "../../HomeTopNav";
import SubjectFilterModal from "../../SubjectFilterModal";

jest.mock("@expo/vector-icons", () => {
  return {
    AntDesign: "AntDesign",
    Entypo: "Entypo",
  };
});

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(msg => {
    if (msg.includes("not wrapped in act")) {
      return;
    }
    console.error(msg);
  });
});

const mockSubjects = [
  { id: 1, name: "Math" },
  { id: 2, name: "Science" },
];

const initialFilters: filterOptions = {
  subject: 1,
  level: 0,
  rating: 0,
  minPrice: 0,
  maxPrice: 100,
  sortBy: "rating_desc",
};

const mockSetFilters = jest.fn();
const mockSetIsVisible = jest.fn();

describe("SubjectFilterModal", () => {
  beforeEach(() => {
    mockSetFilters.mockClear();
    mockSetIsVisible.mockClear();
  });

  it("renders default and given subjects", () => {
    const { getByText } = render(
      <SubjectFilterModal
        subjects={mockSubjects}
        isVisible={true}
        setIsVisible={mockSetIsVisible}
        filters={initialFilters}
        setFilters={mockSetFilters}
      />
    );

    expect(getByText("All subjects")).toBeTruthy();
    expect(getByText("Math")).toBeTruthy();
    expect(getByText("Science")).toBeTruthy();
  });

  it("calls setFilters and setIsVisible on subject press", async () => {
    const { getByText } = render(
      <SubjectFilterModal
        subjects={mockSubjects}
        isVisible={true}
        setIsVisible={mockSetIsVisible}
        filters={initialFilters}
        setFilters={mockSetFilters}
      />
    );

    await act(async () => {
      fireEvent.press(getByText("Science"));
    });

    expect(mockSetFilters).toHaveBeenCalledWith({
      ...initialFilters,
      subject: 2,
    });

    expect(mockSetIsVisible).toHaveBeenCalledWith(false);
  });
});
