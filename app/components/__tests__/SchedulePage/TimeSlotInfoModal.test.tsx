import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import TimeSlotInfoModal from "../../TimeSlotInfoPopup";

const mockSlot = {
  tutor_id: "tutor1",
  student_id: "student1",
  day: 1,
  timeslot_id: 2,
  booked: true,
  listed: true,
  first_name: "Jane",
  last_name: "Doe",
  profile_pic: "https://example.com/avatar.jpg",
  status: "booked" as const,
};

describe("TimeSlotInfoPopup", () => {
  it("renders correctly when data is passed", () => {
    const mockSetData = jest.fn();
    const mockOnClick = jest.fn();

    const { getByText } = render(
      <TimeSlotInfoModal
        data={mockSlot}
        setData={mockSetData}
        buttonText='Confirm'
        onClick={mockOnClick}
      />
    );

    expect(getByText("Jane Doe")).toBeTruthy();
    expect(getByText("Confirm")).toBeTruthy();
  });

  it("calls onClick when button is pressed", () => {
    const mockSetData = jest.fn();
    const mockOnClick = jest.fn();

    const { getByText } = render(
      <TimeSlotInfoModal
        data={mockSlot}
        setData={mockSetData}
        buttonText='Book'
        onClick={mockOnClick}
      />
    );

    const button = getByText("Book");
    fireEvent.press(button);
    expect(mockOnClick).toHaveBeenCalledWith(mockSlot);
  });

  it("closes modal on outside press", () => {
    const mockSetData = jest.fn();

    const { getByTestId } = render(
      <TimeSlotInfoModal
        data={mockSlot}
        setData={mockSetData}
        buttonText='Close'
        onClick={jest.fn()}
      />
    );

    fireEvent.press(getByTestId("outside-modal"));
    expect(mockSetData).toHaveBeenCalledWith(null);
  });
});
