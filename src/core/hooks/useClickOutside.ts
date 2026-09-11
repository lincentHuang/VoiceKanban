import { useEffect, useRef, RefObject } from "react";

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: PointerEvent) => void,
  active: boolean = true
) {
  // Keep the latest handler without re-subscribing on every render (callers pass inline arrows)
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;

    const listener = (event: PointerEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handlerRef.current(event);
    };

    document.addEventListener("pointerdown", listener);

    return () => {
      document.removeEventListener("pointerdown", listener);
    };
  }, [ref, active]);
}
