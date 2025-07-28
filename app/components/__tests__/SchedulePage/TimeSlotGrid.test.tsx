import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import TimeSlotGrid, { timeSlot } from "../../TimeSlotGrid";

const mockTimeSlots: timeSlot[] = [
  {
    tutor_id: "1",
    student_id: "s1",
    day: 1,
    timeslot_id: 101,
    booked: false,
    listed: true,
    first_name: "John",
    last_name: "Doe",
    profile_pic: "",
    status: "not_booked",
  },
  {
    tutor_id: "1",
    student_id: "s2",
    day: 1,
    timeslot_id: 102,
    booked: true,
    listed: true,
    first_name: "Jane",
    last_name: "Smith",
    profile_pic: "",
    status: "booked",
  },
];

describe("TimeSlotGrid", () => {
  it("calls onClickSlot when a non-disabled slot is pressed", () => {
    const mockOnClick = jest.fn();

    const { getByTestId } = render(
      <TimeSlotGrid
        isEditing={true}
        timeSlotsForCurDay={mockTimeSlots}
        onClickSlot={mockOnClick}
      />
    );

    fireEvent.press(getByTestId("timeslot-101"));

    expect(mockOnClick).toHaveBeenCalledWith(mockTimeSlots[0]);
  });

  it("does not call onClickSlot when a booked slot is pressed", () => {
    const mockOnClick = jest.fn();

    const { getByTestId } = render(
      <TimeSlotGrid
        isEditing={true}
        timeSlotsForCurDay={mockTimeSlots}
        onClickSlot={mockOnClick}
      />
    );

    fireEvent.press(getByTestId("timeslot-102"));

    expect(mockOnClick).not.toHaveBeenCalledWith(mockTimeSlots[1]);
  });
});
