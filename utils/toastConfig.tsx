import themeColors from "@/app/themeColors";
import { BaseToast } from "react-native-toast-message";

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: themeColors["primary-700"] }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Poppins_400Regular",
      }}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#ff3333" }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Poppins_400Regular",
      }}
    />
  ),
};

export default toastConfig;
