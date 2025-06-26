import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import RoundTextInput from "../../RoundedTextInput";

jest.mock("../../CustomText", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

describe("RoundTextInput", () => {
  it("renders editable TextInput and responds to typing", () => {
    const mockOnChange = jest.fn();

    const { getByPlaceholderText } = render(
      <RoundTextInput
        value='Hello'
        onChangeText={mockOnChange}
        placeholder='Type here'
        isEditing={true}
      />
    );

    const input = getByPlaceholderText("Type here");
    fireEvent.changeText(input, "New Value");

    expect(mockOnChange).toHaveBeenCalledWith("New Value");
  });
});
