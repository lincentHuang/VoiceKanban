import { Board } from "@/core/types/task";

export type ColumnTransferMode = "move" | "copy";

/**
 * 欄位能不能搬／複製到另一個看板。
 *
 * 共享（群組）看板的欄位屬於所有成員，不能被其中一人整欄搬走，只能複製出去；
 * 反過來，個人看板的欄位可以移動或複製進共享看板。
 */
export function canTransferColumn(source: Board, target: Board, mode: ColumnTransferMode): boolean {
  if (source.id === target.id) return false;
  if (mode === "move" && source.isShared) return false;
  return true;
}
