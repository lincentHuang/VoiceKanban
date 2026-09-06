import React from "react";
import { Palette } from "lucide-react";
import { CoverAspectRatio } from "@/core/types/task";

interface EditTaskCoverBannerProps {
  coverColor: string;
  coverAspectRatio: CoverAspectRatio;
  isMobile: boolean;
  onOpenCoverModal: () => void;
  onRemoveCover: () => void;
}

export const EditTaskCoverBanner: React.FC<EditTaskCoverBannerProps> = ({
  coverColor,
  coverAspectRatio,
  isMobile,
  onOpenCoverModal,
  onRemoveCover,
}) => {
  if (!coverColor) return null;

  const isImageCover = coverColor.startsWith("data:image") || coverColor.startsWith("http");

  const getCoverHeightClass = () => {
    if (coverAspectRatio === "bar") return "min-h-[44px] h-12";
    if (coverAspectRatio === "1:1") return "min-h-[200px] h-56 sm:h-64";
    if (coverAspectRatio === "3:4") return "min-h-[240px] h-64 sm:h-72";
    if (coverAspectRatio === "9:16") return "min-h-[280px] h-72 sm:h-80";
    return "min-h-[120px] h-32 sm:h-40";
  };

  const getRatioLabel = () => {
    if (coverAspectRatio === "banner") return "16:9 橫式";
    if (coverAspectRatio === "1:1") return "1:1 正方形";
    if (coverAspectRatio === "3:4") return "3:4 直式";
    if (coverAspectRatio === "9:16") return "9:16 長版";
    return "飾條";
  };

  return (
    <div
      style={{
        background: isImageCover ? `url(${coverColor}) center/cover no-repeat` : coverColor,
        backgroundColor: !isImageCover && !coverColor.startsWith("linear") ? coverColor : undefined,
      }}
      className={`w-full ${getCoverHeightClass()} ${
        isMobile ? "" : "rounded-t-3xl"
      } relative flex items-end justify-between px-4 pb-3 pt-6 group/cover transition-all duration-300 shadow-xs shrink-0`}
    >
      <span className="text-[10px] bg-black/60 text-white px-2.5 py-1 rounded-lg backdrop-blur-md uppercase font-bold tracking-wider shadow-xs">
        {getRatioLabel()}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCoverModal}
          className="text-xs bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-xl backdrop-blur-md font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-xs"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>變更比例與樣式</span>
        </button>

        <button
          type="button"
          onClick={onRemoveCover}
          className="text-xs bg-black/60 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl backdrop-blur-md font-semibold transition-all hover:scale-105 active:scale-95 shadow-xs"
        >
          ✕ 移除
        </button>
      </div>
    </div>
  );
};
