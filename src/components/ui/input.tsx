"use client";

import * as React from "react";
import { cn } from "@/core/utils/cn";

/**
 * Shared sizing for every text field in the app. Before this existed each form
 * hand-rolled its own padding/radius/font-size, so inputs sitting next to each
 * other (checklist / tags / comments in the task modal) visibly disagreed.
 *
 * Heights are fixed so an input and the button beside it line up, and the font
 * is 16px on phones (below that iOS Safari zooms the viewport on focus) while
 * dropping to the compact desktop size from the `sm` breakpoint up.
 */
export const inputSizes = {
  sm: "h-9 px-3 text-[16px] sm:text-xs",
  md: "h-10 px-3.5 text-[16px] sm:text-sm",
  lg: "h-11 px-4 text-[16px] sm:text-base",
} as const;

export type InputSize = keyof typeof inputSizes;

/** Button heights matching `inputSizes`, for actions rendered beside a field. */
export const fieldButtonSizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-3.5 text-xs sm:text-sm",
  lg: "h-11 px-4 text-sm sm:text-base",
} as const;

export const inputBase =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function inputClass(size: InputSize = "md", className?: string) {
  return cn(inputBase, inputSizes[size], className);
}

export const fieldButtonClass = (size: InputSize = "md", className?: string) =>
  cn(
    "shrink-0 inline-flex items-center justify-center rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
    fieldButtonSizes[size],
    className
  );

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { inputSize?: InputSize };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = "md", ...props }, ref) => (
    <input ref={ref} className={inputClass(inputSize, className)} {...props} />
  )
);
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { inputSize?: InputSize };

/** Same look as `Input`, but vertical padding instead of a fixed height. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, inputSize = "md", ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        inputBase,
        inputSizes[inputSize].replace(/h-\d+/, ""),
        inputSize === "sm" ? "py-2" : "py-2.5",
        "resize-none leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
