// PriceFilter.test.tsx
import { render } from "@testing-library/react-native";
import React from "react";
import { filterOptions } from "../../HomeTopNav";
import PriceFilter from "../../PriceFilter";

// Mock MultiSlider to just render a View with onValuesChange prop accessible
jest.mock("@ptomasroos/react-native-multi-slider", () => {
  return ({ onValuesChange }: { onValuesChange: (vals: number[]) => void }) => {
    return (
      <div
        // @ts-ignore
        testID='mock-slider'
        onClick={() => onValuesChange([10, 50])} // simulate slider change
      />
    );
  };
});

describe("PriceFilter", () => {
  const initialFilter: filterOptions = {
    subject: 0,
    level: 0,
    rating: 0,
    minPrice: 20,
    maxPrice: 100,
    sortBy: "rating_desc",
  };

  it("renders price range correctly", () => {
    const setEditData = jest.fn();
    const { getByText } = render(
      <PriceFilter editData={initialFilter} setEditData={setEditData} />
    );
    expect(getByText("SGD 20 - SGD 100")).toBeTruthy();
  });
});
