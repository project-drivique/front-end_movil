import React from "react";
import { Text, TextProps } from "react-native";

interface IconSymbolProps extends TextProps {
  name: string;
  size?: number;
  color?: string;
  weight?: "light" | "regular" | "medium" | "semibold" | "bold";
}

const iconMap: Record<string, string> = {
  "house.fill": "🏠",
  "paperplane.fill": "✈️",
  "plus.circle.fill": "➕",
  "person.fill": "👤",
};

export function IconSymbol({
  name,
  size = 24,
  color = "#000",
  ...props
}: IconSymbolProps) {
  const iconChar = iconMap[name] || "•";

  return (
    <Text
      {...props}
      style={{
        fontSize: size,
        color: color,
      }}
    >
      {iconChar}
    </Text>
  );
}
