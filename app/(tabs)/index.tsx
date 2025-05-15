import { useRouter } from "expo-router";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function Index() {
  const textColor = useColorScheme() === "dark" ? "white" : "black";
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: textColor }}>Welcome!</Text>
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={{ color: textColor }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
