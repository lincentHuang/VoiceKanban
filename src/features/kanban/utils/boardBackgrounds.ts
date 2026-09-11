export interface BoardBackgroundPreset {
  id: string;
  label: string;
  /** Classes applied to the board canvas root (kept translucent to layer above the app shell). */
  className: string;
  /** Solid, saturated classes used for the small preview swatch in the picker. */
  swatchClassName: string;
}

export const BOARD_BACKGROUND_PRESETS: BoardBackgroundPreset[] = [
  {
    id: "aurora",
    label: "極光紫",
    className:
      "bg-gradient-to-br from-indigo-950/95 via-purple-950/90 to-pink-950/85 dark:from-slate-950 dark:to-slate-900",
    swatchClassName: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
  },
  {
    id: "ocean",
    label: "深海藍",
    className:
      "bg-gradient-to-br from-slate-950/95 via-sky-950/90 to-cyan-950/85 dark:from-slate-950 dark:to-slate-900",
    swatchClassName: "bg-gradient-to-br from-slate-500 via-sky-500 to-cyan-500",
  },
  {
    id: "sunset",
    label: "暮色橘",
    className:
      "bg-gradient-to-br from-orange-950/95 via-red-950/90 to-rose-950/85 dark:from-slate-950 dark:to-slate-900",
    swatchClassName: "bg-gradient-to-br from-orange-500 via-red-500 to-rose-500",
  },
  {
    id: "forest",
    label: "森林綠",
    className:
      "bg-gradient-to-br from-emerald-950/95 via-teal-950/90 to-green-950/85 dark:from-slate-950 dark:to-slate-900",
    swatchClassName: "bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500",
  },
  {
    id: "midnight",
    label: "極夜黑",
    className: "bg-gradient-to-br from-slate-950 via-slate-900 to-black dark:from-black dark:to-slate-950",
    swatchClassName: "bg-gradient-to-br from-slate-600 via-slate-800 to-black",
  },
  {
    id: "candy",
    label: "糖果粉",
    className:
      "bg-gradient-to-br from-fuchsia-950/95 via-pink-950/90 to-rose-950/85 dark:from-slate-950 dark:to-slate-900",
    swatchClassName: "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500",
  },
];

export const DEFAULT_BOARD_BACKGROUND_ID = BOARD_BACKGROUND_PRESETS[0].id;

export function getBoardBackgroundClass(backgroundId?: string): string {
  const preset = BOARD_BACKGROUND_PRESETS.find((p) => p.id === backgroundId);
  return (preset || BOARD_BACKGROUND_PRESETS[0]).className;
}
