"use client";

import { useSyncExternalStore } from "react";

/** Tailwind `sm` breakpoint: anything narrower is treated as a phone layout. */
const MOBILE_QUERY = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** True on phone-width viewports. Always false during SSR / first paint. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}
