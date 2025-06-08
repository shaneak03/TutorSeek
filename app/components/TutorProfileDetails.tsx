import { TutorProfile } from "@/utils/models";
import { Octicons } from "@expo/vector-icons";
import MultiSlider, {
  MarkerProps,
} from "@ptomasroos/react-native-multi-slider";
import { Dimensions, View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import RoundTextInput from "./RoundedTextInput";

type props = {
  tutorData: TutorProfile;
  setTutorData: React.Dispatch<React.SetStateAction<TutorProfile>>;
  isEditing: boolean;
};

export default function TutorProfileDetails({
  tutorData,
  setTutorData,
  isEditing,
}: props) {
  const onValChange = (val: number[]) => {
    console.log(val);
    setTutorData({ ...tutorData, hourly_rate: val[0] });
  };
  return (
    <>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>Bio</CustomText>
        <RoundTextInput
          value={tutorData.bio}
          onChangeText={text => setTutorData(data => ({ ...data, bio: text }))}
          placeholder='Enter your bio'
          isEditing={isEditing}
        />
      </View>
      <View className='w-full'>
        <CustomText className='font-poppins-semibold mb-2'>
          Hourly Rate
        </CustomText>
        {isEditing ? (
          <View className='flex pt-12 items-center'>
            <MultiSlider
              min={0}
              max={200}
              sliderLength={Dimensions.get("window").width - 144}
              customMarker={(markerProps: MarkerProps) => (
                <View className='w-[88]'>
                  <View className='p-2 rounded-lg bg-primary-700 flex items-center'>
                    <CustomText className='text-neutral-100'>
                      SGD {markerProps.currentValue}
                    </CustomText>
                  </View>
                  <View className='h-20 flex justify-start items-center'>
                    <Octicons
                      className='relative bottom-3.5'
                      name='triangle-down'
                      size={24}
                      color={themeColors["primary-700"]}
                    />
                  </View>
                </View>
              )}
              values={[tutorData.hourly_rate]}
              onValuesChange={onValChange}
              selectedStyle={{
                backgroundColor: themeColors["primary-700"],
              }}
            />
          </View>
        ) : (
          <View className='bg-neutral-200 rounded-[48] font-poppins p-4 w-full leading-normal'>
            <CustomText>SGD {tutorData.hourly_rate}.00</CustomText>
          </View>
        )}
      </View>
    </>
  );
}
