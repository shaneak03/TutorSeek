import { dayMap } from "@/utils/days";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import ScheduleDailyHeader from "../../ScheduleDailyHeader";

jest.mock("../../CustomText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

describe("ScheduleDailyHeader", () => {
  it("renders in viewing mode with correct day and count", () => {
    const { getByText } = render(
      <ScheduleDailyHeader
        isEditing={false}
        noOfListed={3}
        activeDay={0}
        canEdit={false}
      />
    );

    expect(getByText("Showing slots for: " + dayMap[1])).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
  });

  it("renders in editing mode with correct label", () => {
    const { getByText, queryByText } = render(
      <ScheduleDailyHeader
        isEditing={true}
        noOfListed={2}
        activeDay={1}
        canEdit={false}
      />
    );

    expect(getByText("Editing slots for: " + dayMap[2])).toBeTruthy();
    expect(queryByText("2")).toBeNull(); // No count in editing mode
  });

  it("renders edit button when canEdit is true", () => {
    const { getByText } = render(
      <ScheduleDailyHeader
        isEditing={false}
        noOfListed={5}
        activeDay={2}
        canEdit={true}
      />
    );

    expect(getByText("Edit slots")).toBeTruthy();
  });

  it("renders save button when editing and canEdit is true", () => {
    const { getByText } = render(
      <ScheduleDailyHeader
        isEditing={true}
        noOfListed={1}
        activeDay={3}
        canEdit={true}
      />
    );

    expect(getByText("Save changes")).toBeTruthy();
  });

  it("calls onPress when edit button is pressed", () => {
    const onPressMock = jest.fn();

    const { getByText } = render(
      <ScheduleDailyHeader
        isEditing={false}
        noOfListed={4}
        activeDay={4}
        canEdit={true}
        onPress={onPressMock}
      />
    );

    fireEvent.press(getByText("Edit slots"));
    expect(onPressMock).toHaveBeenCalled();
  });
});
