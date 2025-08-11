import { UserProfile } from "@/utils/models";
import { withTimeout } from "@/utils/timeoutHelpers";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { getNearest } from "sg-areas";
import { twMerge } from "tailwind-merge";
import themeColors from "../themeColors";
import CustomText from "./CustomText";
import FullPageModal from "./FullPageModal";

type props = {
  profileData: UserProfile;
  setProfileData: React.Dispatch<React.SetStateAction<UserProfile>>;
  isEditing: boolean;
};

type option = { id: string; label: string };

export const locationMap: Record<string, string> = {
  C: "Central",
  E: "East",
  N: "North",
  NE: "North-East",
  W: "West",
};

const locationOptions = [
  { id: "C", label: "Central" },
  { id: "E", label: "East" },
  { id: "N", label: "North" },
  { id: "NE", label: "North-East" },
  { id: "W", label: "West" },
];

const LocationPicker = ({ profileData, setProfileData, isEditing }: props) => {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [fetching, setFetching] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedOption, setSelectedOption] = useState<option>({
    id: "",
    label: "",
  });

  useEffect(() => {
    setSelectedOption({
      id: profileData.location,
      label: locationMap[profileData.location],
    });
  }, [isEditing, profileData]);

  const getLocation = async () => {
    try {
      setFetching(true);

      const { status: newStatus } = await requestPermission();
      if (newStatus !== "granted") {
        return console.log("ACCESS WAS NOT GRANTED!!!");
      }

      let position;
      const location = await Location.getLastKnownPositionAsync();
      if (!location) {
        const { coords } = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          }),
          3000
        );
        position = coords;
      } else {
        position = location.coords;
      }

      const nearest = getNearest(
        { latitude: position.latitude, longitude: position.longitude },
        { closest: 1 }
      );
      const regionId = Object.values(nearest.areas)[0].region;
      Toast.show({
        type: "success",
        text1: "You are in " + locationMap["C"],
      });
      setSelectedOption({ id: regionId, label: locationMap[regionId] });
      setProfileData(profileData => ({
        ...profileData,
        location: regionId,
      }));
      setFetching(false);
    } catch (error) {
      setFetching(false);
      Toast.show({
        type: "error",
        text1: "Error getting your location",
      });
      console.log(error);
    }
  };

  const onSelectOption = (op: option) => {
    setSelectedOption(op);
    setProfileData(profileData => ({
      ...profileData,
      location: op.id,
    }));
    setShowMenu(false);
  };

  return (
    <>
      <FullPageModal
        isVisible={showMenu}
        setIsVisible={setShowMenu}
        title='Regions'
      >
        <View className='p-4 gap-4'>
          {locationOptions.map(op => (
            <TouchableOpacity
              key={op.id}
              onPress={() => onSelectOption(op)}
              className={twMerge(
                "w-full items-center p-4 border-neutral-300  rounded-2xl",
                selectedOption.id === op.id ? "bg-primary-700" : ""
              )}
              style={{ borderWidth: 0.5 }}
            >
              <CustomText
                className={
                  selectedOption.id === op.id ? "text-neutral-100" : ""
                }
              >
                {op.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
      </FullPageModal>
      {!isEditing ? (
        <View className={`bg-neutral-200 rounded-[48] p-4 w-full`}>
          <CustomText
            className={profileData.location === "" ? "opacity-0" : ""}
          >
            {profileData.location === ""
              ? "placeholder"
              : locationMap[profileData.location]}
          </CustomText>
        </View>
      ) : (
        <>
          {fetching ? (
            <View className='flex justify-center items-center h-[54px]'>
              <ActivityIndicator
                size='large'
                color={themeColors["primary-700"]}
              />
            </View>
          ) : (
            <View className='flex-row flex-1 justify-between items-center gap-4 h-[54px]'>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setShowMenu(true)}
                className='border-hairline border-neutral-300 rounded-2xl'
              >
                <View className='flex-row p-4 items-center gap-2 '>
                  <CustomText className='text-sm'>
                    {locationMap[profileData.location]
                      ? locationMap[profileData.location]
                      : "Select region"}
                  </CustomText>
                  <Entypo
                    name='chevron-small-down'
                    size={24}
                    color={themeColors["neutral-300"]}
                  />
                </View>
              </TouchableOpacity>
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={getLocation}
                  className='border-hairline border-neutral-300 rounded-2xl'
                >
                  <View className='flex-row gap-2 items-center p-4'>
                    <CustomText className='text-sm'>Get</CustomText>

                    <FontAwesome6
                      name='location-dot'
                      size={24}
                      color={themeColors["primary-700"]}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </>
  );
};

export default LocationPicker;
