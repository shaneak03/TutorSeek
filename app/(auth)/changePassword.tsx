import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";

const ChangePasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const accessToken = searchParams.access_token;

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    if (!accessToken) {
      setErrorMessage("Invalid or missing access token. Please try again.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        console.error("Error updating password:", error);
      } else {
        setSuccessMessage("Password updated successfully!");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-8 bg-neutral-100 gap-4">
      <CustomText>Enter your new password</CustomText>
      <RoundTextInput
        value={password}
        onChangeText={setPassword}
        placeholder="New Password"
        secureTextEntry
      />
      <RoundTextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        secureTextEntry
      />
      {errorMessage ? (
        <CustomText className="text-red-500">{errorMessage}</CustomText>
      ) : null}
      {successMessage ? (
        <CustomText className="text-green-500">{successMessage}</CustomText>
      ) : null}
      <LargeSolidButton
        buttonText="Change Password"
        onPress={handleChangePassword}
        className="bg-primary-700 text-white"
      />
    </View>
  );
};

export default ChangePasswordScreen;
