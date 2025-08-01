import { Entypo } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Modal, Pressable, View } from "react-native";
import themeColors from "../themeColors";
import CustomText from "./CustomText";

export type option = { label: string; val: any };

type props = {
  options: option[];
  selectedOption: option;
  onSelect: (val: any) => any;
};

export default function DropDownMenu({
  options,
  onSelect,
  selectedOption,
}: props) {
  const [isOpened, setIsOpened] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [menuWidth, setmenuWidth] = useState(0);
  const positionRef = useRef<View>(null);

  useEffect(() => {
    positionRef.current?.measureInWindow((x, y, w, h) => {
      setCoords({ x: x, y: y + h + 8 });
    });
  }, [isOpened]);

  const onlayout = (event: LayoutChangeEvent) => {
    setmenuWidth(event.nativeEvent.layout.width + 20 + 8);
  };

  return (
    <>
      <View
        className='items-start border-hairline border-neutral-300 rounded-2xl w-min bg-neutral-100 absolute'
        onLayout={onlayout}
        style={{ opacity: 0 }}
      >
        {options.map(op => (
          <Pressable key={op.val} className={"p-3 w-full"}>
            <CustomText className={"font-poppins-bold "}>{op.label}</CustomText>
          </Pressable>
        ))}
      </View>
      <Pressable
        ref={positionRef}
        className='flex-row border-hairline border-neutral-300 rounded-2xl p-3 items-center justify-between'
        onPress={() => setIsOpened(true)}
        style={{ width: menuWidth }}
      >
        <CustomText className='font-poppins-bold text-primary-700'>
          {selectedOption.label}
        </CustomText>
        <Entypo
          name='chevron-down'
          size={20}
          color={themeColors["neutral-900"]}
        />
      </Pressable>
      {coords && (
        <Modal visible={isOpened} transparent className='relative'>
          <Pressable
            className='flex-1'
            onPress={() => setIsOpened(false)}
          ></Pressable>
          <View
            className='flex items-start border-hairline border-neutral-300 rounded-2xl w-min bg-neutral-100'
            style={{
              position: "absolute",
              top: coords.y,
              left: coords.x,
              zIndex: 2,
              width: menuWidth,
            }}
          >
            {options.map((op, i) => (
              <Pressable
                key={op.val}
                className={
                  "p-3 w-full " +
                  (i !== options.length - 1
                    ? "border-b-hairline border-neutral-300"
                    : "")
                }
                onPress={() => {
                  onSelect(op);
                  setIsOpened(false);
                }}
              >
                <CustomText
                  className={
                    "font-poppins-bold " +
                    (selectedOption == op ? "text-primary-700" : "")
                  }
                >
                  {op.label}
                </CustomText>
              </Pressable>
            ))}
          </View>
        </Modal>
      )}
    </>
  );
}
