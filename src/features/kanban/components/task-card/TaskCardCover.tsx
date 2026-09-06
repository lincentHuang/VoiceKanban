import React from "react";
import { Task } from "@/core/types/task";

interface Props {
  coverColor?: string | null;
  coverAspectRatio?: string | null;
}

export const TaskCardCover: React.FC<Props> = ({ coverColor, coverAspectRatio }) => {
  if (!coverColor) return null;

  const isImage = coverColor.startsWith("data:image") || coverColor.startsWith("http");

  return (
    <div
      style={{
        background: isImage ? `url(${coverColor}) center/cover no-repeat` : coverColor,
        backgroundColor: !isImage && !coverColor.startsWith("linear") ? coverColor : undefined,
      }}
      className={`w-full transition-all duration-200 ${
        coverAspectRatio === "1:1"
          ? "aspect-square object-cover"
          : coverAspectRatio === "3:4"
          ? "aspect-[3/4] max-h-64 object-cover"
          : coverAspectRatio === "9:16"
          ? "aspect-[9/16] max-h-72 object-cover"
          : coverAspectRatio === "banner" || isImage
          ? "aspect-video max-h-36 object-cover"
          : "h-3"
      }`}
    />
  );
};
