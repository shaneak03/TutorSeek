import { Link } from "expo-router";
import { Text, useColorScheme, View } from "react-native";

export default function Index() {
  const textColor = useColorScheme() === "dark" ? "white" : "black";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: textColor }}>Welcome!</Text>
      <Link href="/login" style={{ color: textColor }}>login</Link>
    </View>
  );
}
