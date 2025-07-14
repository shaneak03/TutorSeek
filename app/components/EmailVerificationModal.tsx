import { supabase } from "@/utils/supabase";
import React, { useState } from "react";
import { Modal, View } from "react-native";
import CustomText from "./CustomText";
import LargeSolidButton from "./LargeSolidButton";

interface EmailVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  email: string; 
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  onClose,
  email,
}) => {
  const [isResendingEmail, setIsResending] = useState(false);
  const [error, setErrorMessage] = useState<string | null>(null);

  const resendConfirmationEmail = async () => {
    setIsResending(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setErrorMessage(`Failed to resend confirmation email: ${error.message} Please try again.`);
        console.error("Resend email error:", error.message);
      } else {
        setErrorMessage("Confirmation email resent. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error resending confirmation email:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-neutral-100 bg-opacity-50">
        <View className="bg-neutral-100 p-6 rounded-lg w-4/5 border border-primary-700">
          <CustomText className="font-poppins-bold text-lg mb-4">
            Email Verification
          </CustomText>
          <CustomText className="mb-4">
            A confirmation email has been sent to your email address. Please verify your email to complete the registration.
          </CustomText>
          {error && (
            <CustomText className="text-red-500 mb-4">{error}</CustomText>
          )}
          <LargeSolidButton
            buttonText={isResendingEmail ? "Resending..." : "Resend Confirmation Email"}
            onPress={isResendingEmail ? undefined : resendConfirmationEmail}
            className={isResendingEmail ? "opacity-50" : ""}
          />
          <LargeSolidButton
            buttonText="Close"
            onPress={onClose}
            className="mt-4"
          />
        </View>
      </View>
    </Modal>
  );
};

export default EmailVerificationModal;
