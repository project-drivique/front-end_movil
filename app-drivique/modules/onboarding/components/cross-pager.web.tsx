import React, { forwardRef, useImperativeHandle, useState } from "react";

interface PageSelectedEvent {
  nativeEvent: { position: number };
}

interface PagerViewProps {
  style?: any;
  initialPage?: number;
  onPageSelected?: (e: PageSelectedEvent) => void;
  children: React.ReactNode;
}

export interface PagerViewHandle {
  setPage: (index: number) => void;
  setPageWithoutAnimation: (index: number) => void;
}

function flattenStyle(style: any): Record<string, any> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, s) => ({ ...acc, ...flattenStyle(s) }), {});
  }
  return style;
}

const PagerView = forwardRef<PagerViewHandle, PagerViewProps>(
  ({ style, initialPage = 0, onPageSelected, children }, ref) => {
    const [current, setCurrent] = useState(initialPage);
    const childrenArray = React.Children.toArray(children);
    const count = childrenArray.length || 1;

    const goTo = (index: number) => {
      const clamped = Math.max(0, Math.min(index, count - 1));
      setCurrent(clamped);
      onPageSelected?.({ nativeEvent: { position: clamped } });
    };

    useImperativeHandle(ref, () => ({
      setPage: (index: number) => goTo(index),
      setPageWithoutAnimation: (index: number) => goTo(index),
    }));

    const flatStyle = flattenStyle(style);

    return (
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          height: "100%",
          ...flatStyle,
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${count * 100}%`,
            height: "100%",
            transform: `translateX(-${(current * 100) / count}%)`,
            transition: "transform 0.3s ease-in-out",
          }}
        >
          {childrenArray.map((child, i) => (
            <div
              key={i}
              style={{
                width: `${100 / count}%`,
                height: "100%",
                flexShrink: 0,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PagerView.displayName = "PagerView";

export default PagerView;
