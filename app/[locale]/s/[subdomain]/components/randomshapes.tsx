"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const shapes = [
  [
    "M-88 467C-38 353 24 320 108 306C197 291 190 218 292 204C390 191 412 71 563 42L579 553L-88 562Z",
    "#377CF6",
    "blur-[48px]",
  ],
  [
    "M-82 460C-28 383 44 354 104 365C174 378 207 324 274 341C333 356 377 409 493 442C548 458 579 505 565 570H-74Z",
    "#79BDFF",
    "blur-[42px]",
  ],
  [
    "M46 523C75 447 140 427 203 444C266 461 307 412 376 438C444 463 487 511 521 587L38 590Z",
    "#C6E1FF",
    "blur-[32px]",
  ],
  [
    "M402 31C476 8 556 44 585 109C618 184 566 229 580 302C592 370 546 429 485 426C418 422 393 365 414 303C435 241 371 193 380 124C386 81 395 53 402 31Z",
    "#3157EA",
    "blur-[56px]",
  ],
];

export default function RandomShape({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [positions, setPositions] = useState(
    shapes.map(() => ({ x: 0, y: 0, rotate: 0, scale: 1 })),
  );

  useEffect(() => {
    setPositions(
      shapes.map(() => ({
        x: random(-100, 100),
        y: random(-100, 100),
        rotate: random(-35, 35),
        scale: random(0.8, 1.25),
      })),
    );
  }, []);

  return (
    <div className="relative size-12 overflow-hidden rounded-full  ">
      <svg viewBox="0 0 500 500" className="absolute inset-0 size-full">
        {shapes.map(([d, fill, blur], index) => {
          const { x, y, rotate, scale } = positions[index];

          return (
            <path
              key={d}
              d={d}
              fill={fill}
              className={`${blur} origin-center transition-transform duration-1000`}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
              }}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-white">
        {children ?? <Sparkles className="size-5" />}
      </div>
    </div>
  );
}
