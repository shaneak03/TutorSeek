import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import StarRow from "../../StarRow";

describe("RatingFilter", () => {
  it("calls the function with the correct rating id", async () => {
    const mockFn = jest.fn();

    const { getByTestId } = render(
      <StarRow size={16} rating={4} onClickStar={mockFn} />
    );

    await act(async () => {
      fireEvent.press(getByTestId("star-3"));
    });

    expect(mockFn).toHaveBeenCalledWith(3);
  });
});
