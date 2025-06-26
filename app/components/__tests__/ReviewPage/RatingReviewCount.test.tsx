import React from "react";
import { render } from "@testing-library/react-native";
import RatingReviewCount from "../../RatingReviewCount";

describe("RatingReviewCount", () => {
  it("renders the rating count with two decimals and review count correctly", () => {
    const { getByText } = render(
      <RatingReviewCount ratingCount={4.753} reviewCount={12} />
    );

    // Check rating count rounded to 2 decimals
    expect(getByText("4.75 ")).toBeTruthy();

    // Check fixed 5.00 text
    expect(getByText("5.00")).toBeTruthy();

    // Check review count text
    expect(getByText("(12 reviews)")).toBeTruthy();
  });

  it("renders zero rating and zero reviews correctly", () => {
    const { getByText } = render(
      <RatingReviewCount ratingCount={0} reviewCount={0} />
    );

    expect(getByText("0.00 ")).toBeTruthy();
    expect(getByText("(0 reviews)")).toBeTruthy();
  });
});
