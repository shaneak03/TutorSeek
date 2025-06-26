import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import ProfileIcon from "../../ProfileIcon";

// Mocks
jest.mock("@expo/vector-icons/Feather", () => "Feather");
jest.mock("../../UserIcon", () => "UserIcon");
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "mock-image-uri.jpg" }],
    })
  ),
}));
jest.mock("expo-file-system", () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve("mock-base64-string")),
  EncodingType: { Base64: "base64" },
}));

jest.mock("@/utils/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({ data: { profile_icon_url: "old-image.jpg" } })
          ),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        remove: jest.fn(() => Promise.resolve({ error: null })),
        upload: jest.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: "https://mocked.public.url/avatar.jpg" },
        })),
      })),
    },
  },
}));

describe("ProfileIcon", () => {
  it("renders correctly and does not show edit icon when not editing", () => {
    const { queryByText } = render(
      <ProfileIcon avatarUrl='avatar.jpg' setAvatarUrl={jest.fn()} />
    );

    expect(queryByText("edit-2")).toBeNull();
  });

  it("shows edit icon and allows image picking when editing", async () => {
    const mockSetAvatarUrl = jest.fn();

    const { getByRole } = render(
      <ProfileIcon
        avatarUrl='avatar.jpg'
        setAvatarUrl={mockSetAvatarUrl}
        isEditing={true}
      />
    );

    const pressable = getByRole("button");

    await waitFor(() => fireEvent.press(pressable));

    expect(mockSetAvatarUrl).toHaveBeenCalledWith("mock-image-uri.jpg");
  });
});
