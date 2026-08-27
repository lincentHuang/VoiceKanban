/**
 * Lexorank / Fractional Indexing Helper
 * Provides O(1) single-document reordering for Kanban boards without bulk database rewrites.
 */

const BASE_CHAR_START = 48; // '0'
const BASE_CHAR_END = 122; // 'z'
const MID_CHAR = "U";
const DEFAULT_STEP = 1000;

export function initialOrderKey(index: number): string {
  // Generate keys like '001000', '002000', '003000'
  const value = (index + 1) * DEFAULT_STEP;
  return value.toString(36).padStart(6, "0");
}

export function generateOrderKeyBetween(prevKey?: string | null, nextKey?: string | null): string {
  if (!prevKey && !nextKey) {
    return initialOrderKey(0);
  }

  // Insert at top (before first item)
  if (!prevKey && nextKey) {
    const nextVal = parseInt(nextKey, 36) || DEFAULT_STEP;
    if (nextVal > 1) {
      const newVal = Math.floor(nextVal / 2);
      return newVal.toString(36).padStart(6, "0");
    }
    // Prefix with a smaller character if hitting floor
    return "0" + nextKey;
  }

  // Insert at bottom (after last item)
  if (prevKey && !nextKey) {
    const prevVal = parseInt(prevKey, 36) || DEFAULT_STEP;
    const newVal = prevVal + DEFAULT_STEP;
    return newVal.toString(36).padStart(6, "0");
  }

  // Insert between prevKey and nextKey
  if (prevKey && nextKey) {
    const prevVal = parseInt(prevKey, 36);
    const nextVal = parseInt(nextKey, 36);

    if (!isNaN(prevVal) && !isNaN(nextVal) && nextVal - prevVal > 1) {
      const midVal = Math.floor((prevVal + nextVal) / 2);
      return midVal.toString(36).padStart(6, "0");
    }

    // If numerical gap is 0 or 1, append a mid-character for string-based fraction
    return prevKey + MID_CHAR;
  }

  return initialOrderKey(0);
}
