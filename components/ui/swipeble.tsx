import React, { useState, useRef, useEffect, TouchEvent } from "react";
import { Settings, CircleCheckBig, Info, EllipsisVertical } from "lucide-react";

interface SwipeableItemProps {
  children: React.ReactNode;
  onChange?: () => void;
  onDelete?: () => void;
  onDesktopAction?: () => void;
  actionWidth?: number;
  desktopBreakpoint?: number;
  onInfo?: () => void; // Optional handler for Info button
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onChange,
  onDelete,
  onDesktopAction,
  actionWidth = 60,
  desktopBreakpoint = 768,
  onInfo,
}) => {
  // With an additional button, we now have three actions.
  const totalButtons = 3;
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const startXRef = useRef<number>(0);

  // Update maxTranslateX for three buttons
  const maxTranslateX = -actionWidth * totalButtons;

  useEffect(() => {
    const checkDesktop = () =>
      setIsDesktop(window.innerWidth >= desktopBreakpoint);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [desktopBreakpoint]);

  const handleTouchStart = (e: TouchEvent) => {
    setIsAnimating(false);
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    let dx = currentX - startXRef.current;

    if (translateX < 0) {
      dx = Math.min(dx, -translateX);
    }

    if (translateX === 0 && dx < 0) {
      dx = Math.max(dx, maxTranslateX);
    }

    let newTranslateX = translateX + dx;
    newTranslateX = Math.min(Math.max(newTranslateX, maxTranslateX), 0);
    setTranslateX(newTranslateX);

    startXRef.current = currentX;
  };

  const finalizeSwipe = () => {
    setIsAnimating(true);
    if (translateX < maxTranslateX / 2) {
      setTranslateX(maxTranslateX);
    } else {
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    finalizeSwipe();
  };

  const handleContentClick = () => {
    if (translateX !== 0) {
      setIsAnimating(true);
      setTranslateX(0);
    }
  };

  return (
    <div className="select-none relative overflow-hidden rounded-tr-md rounded-br-md">
      {/* Action Buttons */}
      <div
        className="absolute top-0 right-0 flex h-full"
        style={{ width: `${-maxTranslateX}px` }}
      >
        <button className="flex-1 w-1/3 px-4 py-2" onClick={onChange}>
          <Settings className="mx-auto text-neutral-600" />
          <span className="sr-only">Setting</span>
        </button>
        <button className="flex-1 w-1/3 px-4 py-2" onClick={onInfo}>
          <Info className="mx-auto text-blue-600" />
          <span className="sr-only">Info</span>
        </button>
        <button
          className="flex-1 w-1/3 text-green-600 px-4 py-2"
          onClick={onDelete}
        >
          <CircleCheckBig className="mx-auto" />
          <span className="sr-only">Complete</span>
        </button>
      </div>

      {/* Optional Desktop Menu Icon */}
      {isDesktop && onDesktopAction && (
        <button
          className="absolute right-3 top-0 h-full z-10 text-foreground hover:text-gray-800"
          onClick={onDesktopAction}
          title="Desktop Action"
        >
          <EllipsisVertical size={16} />
        </button>
      )}

      {/* Swipeable Content */}
      <div
        className={`bg-white select-none ${
          isAnimating ? "transition-transform duration-200" : ""
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableItem;
