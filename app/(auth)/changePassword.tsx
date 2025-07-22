import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from 'react-native-toast-message';
import CustomText from "../components/CustomText";
import LargeSolidButton from "../components/LargeSolidButton";
import RoundTextInput from "../components/RoundedTextInput";
import themeColors from "../themeColors";

const ChangePasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const accessToken = searchParams.access_token;

  useEffect(() => {
    if (errorMessage) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  }, [errorMessage]);

  const handleChangePassword = async () => {
    if (loading) return;
    if (password !== confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    if (!accessToken) {
      setErrorMessage("Invalid access token. Please try resetting your password again.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser(
        { password }
      );

      if (error) {
        console.error("Password update error:", error);
        setLoading(false);
        return setErrorMessage(error.message);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password updated!',
      });

      setTimeout(() => {
        setLoading(false);
        router.push("/(tabs)");
      }, 2000);
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred");
      setLoading(false);
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
      {loading ? (
        <ActivityIndicator size="large" color={themeColors["primary-700"]} />
      ) : (
        <LargeSolidButton
          buttonText="Change Password"
          onPress={handleChangePassword}
          className="bg-primary-700 text-white"
        />
      )}
    </View>
  );
};

export default ChangePasswordScreen;
