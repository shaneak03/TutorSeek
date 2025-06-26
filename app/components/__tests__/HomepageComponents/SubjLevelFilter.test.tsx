import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { filterOptions } from "../../HomeTopNav";
import SubjectLevelPicker from "../../SubjLevelFilter";

describe("SubjectLevelPicker", () => {
  const mockSetEditData = jest.fn();

  const initialEditData: filterOptions = {
    subject: 0,
    level: 0,
    rating: 0,
    minPrice: 0,
    maxPrice: 100,
    sortBy: "rating_desc",
  };

  beforeEach(() => {
    mockSetEditData.mockClear();
  });

  it("renders correctly with initial level", () => {
    const { getByText } = render(
      <SubjectLevelPicker
        editData={initialEditData}
        setEditData={mockSetEditData}
      />
    );

    // Radio buttons labels should be visible
    expect(getByText("PSLE")).toBeTruthy();
    expect(getByText("O-level")).toBeTruthy();
    expect(getByText("A-level")).toBeTruthy();
    expect(getByText("All")).toBeTruthy();
  });

  it("calls setEditData with the correct level when a radio button is pressed", () => {
    const { getByText } = render(
      <SubjectLevelPicker
        editData={initialEditData}
        setEditData={mockSetEditData}
      />
    );

    // Press "PSLE" button, which has id = "1"
    fireEvent.press(getByText("PSLE"));

    expect(mockSetEditData).toHaveBeenCalledWith({
      ...initialEditData,
      level: 1,
    });
  });
});
