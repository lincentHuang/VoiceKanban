/**
 * UI Component Contract & Type Definitions
 * Designed for Radix UI Primitives Integration
 */

export type UIComponentState = "loading" | "empty" | "error" | "success" | "active" | "idle";

export interface PopoverBaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
}

export interface DropdownMenuBaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string;
}
