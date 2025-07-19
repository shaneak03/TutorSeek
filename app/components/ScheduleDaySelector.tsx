import { ScrollView, TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import { dayTruncMap } from "@/utils/days";

type props = {
  activeDay: number;
  setActiveDay: React.Dispatch<React.SetStateAction<number>>;
};

const ScheduleDaySelector = ({ activeDay, setActiveDay }: props) => {
  return (
    <ScrollView
      horizontal={true}
      className='flex-grow-0'
      contentContainerClassName='p-4 gap-4'
      showsHorizontalScrollIndicator={false}
    >
      {Array.from({ length: 7 }, (_, i) => i).map(i => (
        <TouchableOpacity
          key={i}
          activeOpacity={0.4}
          onPress={() => setActiveDay(i)}
          className={
            "w-[50px] h-[50px] justify-center items-center rounded-full border-hairline " +
            (i == activeDay
              ? "bg-primary-700 border-primary-700"
              : "border-neutral-300")
          }
        >
          <CustomText
            className={
              "font-poppins-semibold text-sm " +
              (i == activeDay ? "text-neutral-100" : "")
            }
          >
            {dayTruncMap.get(i)}
          </CustomText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
export default ScheduleDaySelector;
