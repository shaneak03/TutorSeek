import { Feather, FontAwesome, Octicons } from "@expo/vector-icons";
import MultiSlider, {
  MarkerProps,
} from "@ptomasroos/react-native-multi-slider";
import { Dimensions, View } from "react-native";
import { TutorProfileData } from "../(tabs)/(profile)";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

type props = {
  tutorData: TutorProfileData;
  setTutorData: React.Dispatch<React.SetStateAction<TutorProfileData>>;
  isEditing: boolean;
};

const HourlyRateEditor = ({ isEditing, tutorData, setTutorData }: props) => {
  const onValChange = (val: number[]) => {
    console.log(val);
    setTutorData({ ...tutorData, hourly_rate: val[0] });
  };

  return (
    <View className='w-full'>
      <View className='w-full'>
        <View className='flex-row justify-between items-center'>
          <CustomText className='font-poppins-semibold mb-2'>
            Hourly Rate
          </CustomText>
          {tutorData.hourly_rate === 0 && (
            <View className='flex-row justify-between items-center gap-1'>
              <Feather
                name='alert-circle'
                size={16}
                color={themeColors["primary-700"]}
              />
              <CustomText className='text-sm text-primary-700'>
                Required
              </CustomText>
            </View>
          )}
        </View>
      </View>
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
                  <FontAwesome
                    className='relative bottom-4'
                    name='circle'
                    size={16}
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
            trackStyle={{ height: 3 }}
          />
        </View>
      ) : (
        <View className='bg-neutral-200 rounded-[48] font-poppins p-4 w-full leading-normal'>
          <CustomText>SGD {tutorData.hourly_rate}.00</CustomText>
        </View>
      )}
    </View>
  );
};

export default HourlyRateEditor;
