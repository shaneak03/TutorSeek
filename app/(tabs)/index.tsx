import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Index = () => {
  const router = useRouter();

  const [datas, setData] = useState([]);

  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const { data: data, error } = await supabase.from("data").select();

  //       if (error) {
  //         console.error("Error fetching data:", error.message);
  //         return;
  //       }

  //       if (data && data.length > 0) {
  //         setData(datas);
  //       }
  //     } catch (error: any) {
  //       console.error("Error fetching todos:", error.message);
  //     }
  //   };

  //   getData();
  // }, []);

  return (
    <View className='flex gap-4 justify-center items-center h-96'>
      <Text className='text-blue-200 font-poppins'>Welcome!</Text>
      <TouchableOpacity
        className='border-cyan-100 border-2 p-4 rounded-2xl bg-pink-50'
        onPress={() => router.push("/login")}
      >
        <Text className='text-blue-700'>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;
