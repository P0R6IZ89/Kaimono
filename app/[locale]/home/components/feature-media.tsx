"use client";

import { useState } from "react";
import { Film } from "lucide-react";

type FeatureMediaProps = {
  videoSource?: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

export function FeatureMedia({
  videoSource,
  fallbackTitle,
  fallbackDescription,
}: FeatureMediaProps) {
  const [hasVideoError, setHasVideoError] = useState(false);
  const shouldShowVideo = videoSource && !hasVideoError;

  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-lg bg-muted/50 text-center">
      {shouldShowVideo ? (
        <video
          src={videoSource}
          autoPlay
          muted
          playsInline
          preload="metadata"
          className="w-full rounded-sm"
          onError={() => setHasVideoError(true)}
        />
      ) : (
        <>
          <Film className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-medium">{fallbackTitle}</p>
          <p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
            {fallbackDescription}
          </p>
        </>
      )}
    </div>
  );
}
