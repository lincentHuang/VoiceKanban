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
    const nextVal = parseInt(nextKey.slice(0, 6), 36) || DEFAULT_STEP;
    if (nextVal > 1) {
      const newVal = Math.floor(nextVal / 2);
      const res = newVal.toString(36).padStart(6, "0");
      if (res < nextKey) return res;
    }
    return "0" + nextKey;
  }

  // Insert at bottom (after last item) - ensure strictly greater than prevKey in string comparison
  if (prevKey && !nextKey) {
    const prevVal = parseInt(prevKey, 36);
    if (!isNaN(prevVal) && prevVal > 0) {
      const newVal = prevVal + DEFAULT_STEP;
      const res = newVal.toString(36).padStart(Math.max(6, prevKey.length), "0");
      if (res > prevKey) {
        return res;
      }
    }
    // Guarantee lexicographical increment
    return prevKey + "z";
  }

  // Insert between prevKey and nextKey
  if (prevKey && nextKey) {
    const prevVal = parseInt(prevKey, 36);
    const nextVal = parseInt(nextKey, 36);

    if (!isNaN(prevVal) && !isNaN(nextVal) && nextVal - prevVal > 1) {
      const midVal = Math.floor((prevVal + nextVal) / 2);
      const res = midVal.toString(36).padStart(Math.max(6, prevKey.length), "0");
      if (res > prevKey && res < nextKey) {
        return res;
      }
    }

    // String fraction insertion
    return prevKey + MID_CHAR;
  }

  return initialOrderKey(0);
}
