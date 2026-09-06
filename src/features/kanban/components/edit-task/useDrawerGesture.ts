import { useState, useRef, useEffect } from "react";

export function useDrawerGesture(onClose: () => void) {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerDragY, setDrawerDragY] = useState(0);
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);

  const scrollContentRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isPullingFromTopRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCloseDrawer = () => {
    if (isMobile) {
      setIsClosingDrawer(true);
      setTimeout(() => onClose(), 200);
    } else {
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
    const scrollTop = scrollContentRef.current ? scrollContentRef.current.scrollTop : 0;
    isPullingFromTopRef.current = scrollTop <= 2;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isPullingFromTopRef.current) return;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;
    if (deltaY > 0) {
      setIsDraggingDrawer(true);
      const dampedY = deltaY < 150 ? deltaY : 150 + (deltaY - 150) * 0.6;
      setDrawerDragY(dampedY);
    } else {
      setDrawerDragY(0);
      setIsDraggingDrawer(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isPullingFromTopRef.current) return;
    isPullingFromTopRef.current = false;
    setIsDraggingDrawer(false);
    const touchDuration = Date.now() - touchStartTimeRef.current;
    const velocity = drawerDragY / Math.max(touchDuration, 1);

    if (drawerDragY > 90 || (drawerDragY > 40 && velocity > 0.4)) {
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(15); } catch {}
      }
      handleCloseDrawer();
    } else {
      setDrawerDragY(0);
    }
  };

  return {
    isMobile,
    drawerDragY,
    isDraggingDrawer,
    isClosingDrawer,
    scrollContentRef,
    handleCloseDrawer,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
