import { supabase } from "@/utils/supabase";
import Feather from "@expo/vector-icons/Feather";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import themeColors from "../themeColors";
import UserIcon from "./UserIcon";

type props = {
  avatarUrl: string;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
  isEditing?: boolean;
};

if (!global.Buffer) {
  global.Buffer = Buffer;
}

export const updateProfileIcon = async (user_id: string, uri: string) => {
  try {
    const timestamp = new Date().toISOString();
    const fileExt = uri.split(".").pop();
    const filePath = `${user_id}_${timestamp}.${fileExt}`;
    const file = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const storage = supabase.storage.from("avatars");

    // Get old profile URL first
    const { data: userData } = await supabase
      .from("users")
      .select("profile_icon_url")
      .eq("id", user_id)
      .single();

    // Delete old avatar
    if (userData?.profile_icon_url) {
      console.log("Old avatar URL found:", userData.profile_icon_url);
      const oldFilePath = userData.profile_icon_url.split("/").pop();
      if (oldFilePath) {
        console.log("Deleting old avatar:", oldFilePath);
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([oldFilePath]);
        if (deleteError) throw deleteError;
      }
    }

    // Upload new avatar
    const { error: uploadError } = await storage.upload(
      filePath,
      Buffer.from(file, "base64"),
      {
        contentType: "image/jpeg",
        upsert: true, // Overwrite if file already exists
        metadata: {
          owner: user_id, // Store user ID in metadata
        },
      }
    );

    if (uploadError) throw uploadError;
    //get public image url
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update user's profile icon URL in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_icon_url: publicUrl })
      .eq("id", user_id);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Profile update failed:", error);
    Toast.show({ type: "error", text1: "Error", text2: "Failed to update profile picture." });
  }
};

export default function ProfileIcon({
  isEditing = false,
  avatarUrl,
  setAvatarUrl,
}: props) {
  const handleImagePicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Toast.show({ type: "error", text1: "Permission required", text2: "Permission to access camera roll is required!" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        selectionLimit: 1,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;

      const uri = result.assets[0].uri;
      setAvatarUrl(uri);
    } catch (error) {
      console.error("Failed to pick image", error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to pick image" });
    }
  };

  return (
    <>
      <Pressable
        onPress={handleImagePicker}
        className='relative'
        disabled={!isEditing}
        accessibilityRole='button'
      >
        <UserIcon avatarUrl={avatarUrl} size={168} />
        {isEditing && (
          <View className='bg-primary-700 rounded-full p-[12] absolute bottom-1 right-1'>
            <Feather
              name='edit-2'
              size={16}
              color={themeColors["neutral-200"]}
            />
          </View>
        )}
      </Pressable>
    </>
  );
}
