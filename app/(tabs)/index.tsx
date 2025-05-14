import { useRouter } from "expo-router";
import { Text, useColorScheme, View } from "react-native";
import { Button } from "tamagui";

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
      <Button onPress={() => router.push('/login')}>
        <Text style={{ color: textColor }}>Login</Text>
      </Button>
    </View>
  );
}
