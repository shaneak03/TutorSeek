import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { filterOptions } from "../../HomeTopNav";
import SubjectFilterModal from "../../SubjectFilterModal";

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

  it("calls setFilters and setIsVisible on subject press", () => {
    const { getByText } = render(
      <SubjectFilterModal
        subjects={mockSubjects}
        isVisible={true}
        setIsVisible={mockSetIsVisible}
        filters={initialFilters}
        setFilters={mockSetFilters}
      />
    );

    fireEvent.press(getByText("Science"));

    expect(mockSetFilters).toHaveBeenCalledWith({
      ...initialFilters,
      subject: 2,
    });

    expect(mockSetIsVisible).toHaveBeenCalledWith(false);
  });
});
