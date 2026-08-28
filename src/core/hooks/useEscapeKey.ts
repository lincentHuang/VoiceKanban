import { useEffect } from "react";

export function useEscapeKey(handler: (event: KeyboardEvent) => void, active: boolean = true) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handler(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handler, active]);
}
