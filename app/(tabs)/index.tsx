import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function Index() {
  const textColor = useColorScheme() === "dark" ? "white" : "black";
  const router = useRouter();

  const [datas, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: data, error } = await supabase.from('data').select();

        if (error) {
          console.error('Error fetching data:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setData(datas);
        }
      } catch (error : any) {
        console.error('Error fetching todos:', error.message);
      }
    };

    getData();
  }, []);

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
