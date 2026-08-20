import * as Haptics from "expo-haptics";
import React from "react";
import { Platform } from "react-native";

export function HapticTab(props: any) {
  const handlePress = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPress?.();
  };

  return <props.children {...props} onPress={handlePress} />;
}
