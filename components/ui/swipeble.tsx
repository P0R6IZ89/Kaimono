import React, { useState, useRef, TouchEvent } from "react";
import { Settings, CircleCheckBig, Info } from "lucide-react";

interface SwipeableItemProps {
  children: React.ReactNode;
  onChange?: () => void;
  onDelete?: () => void;
  onDesktopAction?: () => void;
  actionWidth?: number;
  onInfo?: () => void; // Optional handler for Info button
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onChange,
  onDelete,
  actionWidth = 60,
  onInfo,
}) => {
  // With an additional button, we now have three actions.
  const totalButtons = 3;
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startXRef = useRef<number>(0);

  // Update maxTranslateX for three buttons
  const maxTranslateX = -actionWidth * totalButtons;

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
      <div
        className="absolute top-0 right-0 flex h-full"
        style={{ width: `${-maxTranslateX}px` }}
      >
        <button className="flex-1 w-1/3 px-4 py-2" onClick={onDelete}>
          <CircleCheckBig
            strokeWidth={1.5}
            className="mx-auto text-green-700 rounded-full bg-green-50"
          />
          <span className="sr-only">Complete</span>
        </button>
        <button className="flex-1 w-1/3 px-4 py-2" onClick={onInfo}>
          <Info strokeWidth={1.5} className="mx-auto " />
          <span className="sr-only">Info</span>
        </button>
        <button className="flex-1 w-1/3 px-4 py-2" onClick={onChange}>
          <Settings strokeWidth={1.5} className="mx-auto " />
          <span className="sr-only">Setting</span>
        </button>
      </div>

      <div
        className={`py-6 px-4 bg-background border rounded-md select-none ${
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
