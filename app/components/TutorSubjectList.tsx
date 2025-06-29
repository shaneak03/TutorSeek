import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { TouchableHighlight, View } from "react-native";
import { TutorProfileData } from "../(tabs)/(profile)";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

type props = {
  tutorData: TutorProfileData;
  setTutorData: React.Dispatch<React.SetStateAction<TutorProfileData>>;
  isEditing?: boolean;
};

const TutorSubjectList = ({
  tutorData,
  setTutorData,
  isEditing = false,
}: props) => {
  const onDeleteSubject = (tutorSubjectId: number) => {
    setTutorData(data => ({
      ...data,
      subjects: data.subjects.filter(s => s.id != tutorSubjectId),
    }));
  };

  return (
    <View>
      {tutorData.subjects.length == 0 && (
        <View>
          <CustomText>No subjects</CustomText>
        </View>
      )}
      {tutorData.subjects.length !== 0 &&
        tutorData.subjects.map(s => (
          <View
            key={`${s.subject}#${s.level}`}
            className='flex-row justify-between items-center px-4 py-1'
          >
            <View className='flex-row gap-2 items-center'>
              <FontAwesome
                name='circle'
                size={12}
                color={themeColors["primary-700"]}
              />
              <CustomText>
                {s.level} {s.subject}
              </CustomText>
            </View>
            {isEditing && (
              <TouchableHighlight
                className='rounded-full p-2'
                underlayColor={themeColors["primary-700"]}
                onPress={() => onDeleteSubject(s.id)}
                accessibilityRole='button'
              >
                <AntDesign
                  name='delete'
                  size={16}
                  color={themeColors["neutral-900"]}
                />
              </TouchableHighlight>
            )}
          </View>
        ))}
    </View>
  );
};

export default TutorSubjectList;
