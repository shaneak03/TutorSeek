import { dayMap } from "@/utils/days";
import timeSlotMap from "@/utils/timeSlotMap";
import React from "react";
import { Pressable } from "react-native";
import Modal from "react-native-modal";
import CustomText from "./CustomText";
import LargeSolidButton from "./LargeSolidButton";
import { timeSlot } from "./TimeSlotGrid";
import UserIcon from "./UserIcon";

type props = {
  data: timeSlot | null;
  setData: React.Dispatch<React.SetStateAction<timeSlot | null>>;
  buttonText: string;
  onClick: (ts: timeSlot) => any;
};

const TimeSlotInfoModal = ({ data, setData, buttonText, onClick }: props) => {
  return (
    <Modal isVisible={data !== null}>
      <Pressable
        testID='outside-modal'
        className='flex-1 justify-center items-center'
        onPress={() => setData(null)}
      >
        {data && (
          <Pressable
            onPress={e => e.stopPropagation()}
            className='bg-neutral-100 rounded-2xl justify-center items-center relative border-primary-700 border-2 p-4 gap-1'
            style={{ width: "90%" }}
          >
            <UserIcon size={128} avatarUrl={data?.profile_pic ?? ""} />
            <CustomText className='text-xl font-poppins-bold mt-2'>
              {data?.first_name} {data?.last_name}
            </CustomText>
            {data && (
              <CustomText>
                {dayMap[data.day + 1]}{" "}
                {timeSlotMap.get(data.timeslot_id)?.slice(0, -3)}
              </CustomText>
            )}
            <LargeSolidButton
              onPress={() => onClick(data)}
              buttonText={buttonText}
              className='mt-4'
            ></LargeSolidButton>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
};

export default TimeSlotInfoModal;
