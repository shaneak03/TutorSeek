import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import ScheduleDaySelector from "../../ScheduleDaySelector";

describe("ScheduleDaySelector", () => {
  it("calls setActiveDay when a day is pressed", () => {
    const mockSetActiveDay = jest.fn();

    const { getByTestId } = render(
      <ScheduleDaySelector activeDay={0} setActiveDay={mockSetActiveDay} />
    );

    const dayButton = getByTestId("day-button-1");

    fireEvent.press(dayButton);

    expect(mockSetActiveDay).toHaveBeenCalledWith(1);
  });
});
