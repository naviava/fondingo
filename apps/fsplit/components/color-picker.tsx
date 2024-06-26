"use client";

import { memo, useRef, useState } from "react";
import { CirclePicker } from "react-color";

interface IProps {
  color: string;
  /* eslint-disable no-unused-vars */
  handleColorChange: (value: string) => void;
}

export const ColorPicker = memo(_ColorPicker);
function _ColorPicker({ color, handleColorChange }: IProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      ref={ref}
      role="button"
      onClick={() => setIsOpen((prev) => !prev)}
      className="relative flex aspect-square h-14 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-200/80"
    >
      <div
        className="aspect-square h-9 rounded-full"
        style={{ backgroundColor: color }}
      />
      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            ref.current?.click();
          }}
          className="absolute left-0 top-16 z-10 rounded-lg border border-neutral-300 bg-neutral-200 p-2"
        >
          <CirclePicker
            color={color}
            onChangeComplete={(color) => handleColorChange(color.hex)}
          />
        </div>
      )}
    </div>
  );
}
