import { supabase } from "@/utils/supabase";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

type props = {
  profile_icon_url?: string
  user_id?: string;  
}

if (!global.Buffer) {
  global.Buffer = Buffer;
}

export default function ProfileIcon({profile_icon_url, user_id, ...props}: props) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile_icon_url);

  const handleImagePicker = async () => {
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          alert("Permission to access camera roll is required!");
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
        const fileExt = uri.split(".").pop();
        const filePath = `avatars/${user_id}.${fileExt}`;

        const file = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const storage = supabase.storage.from("avatars");
        
        const { error: uploadError } = await storage
        .upload(filePath, Buffer.from(file, "base64"), {
          contentType: "image/jpeg", 
          upsert: true, // Overwrite if file already exists
          metadata: {
            owner: user_id, // Store user ID in metadata
          }
        });

        if (uploadError) {
          throw uploadError;
        }

        const { data, error: urlError } = await supabase.storage
          .from("avatars")
          .createSignedUrl(filePath, 60 * 60);
        
        if (urlError) {
          throw urlError;
        }

        // Update user's profile icon URL in the database
        const { error: updateError } = await supabase
          .from("users")
          .update({ profile_icon_url: data.signedUrl })
          .eq("id", user_id);
        if (updateError) {
          throw updateError;
        }

        setAvatarUrl(data.signedUrl);

      } catch (error) {
        console.error("Profile update failed:", error);
        alert("Failed to update profile picture.");
      }
  };
  
  return (
    <Pressable onPress={handleImagePicker}>
      <View className='bg-black rounded-full border-4 border-primary-700'>
        <Image
          source={avatarUrl ? avatarUrl : require("../../assets/images/profile_icon.jpg")}
          style={{ width: 168, height: 168, borderRadius: 100 }}
          contentFit='cover'
        />
      </View>
    </Pressable>
  );
}
