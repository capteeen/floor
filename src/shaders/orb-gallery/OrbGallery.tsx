"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { mountOrbGallery } from "./mount-orb-gallery";

export type OrbGalleryProps = {
  className?: string;
  style?: CSSProperties;
};

export function OrbGallery({ className = "", style }: OrbGalleryProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return undefined;
    return mountOrbGallery(host, canvas);
  }, []);

  return (
    <div
      ref={hostRef}
      className={`threeui-background orb-gallery${className ? ` ${className}` : ""}`}
      role="img"
      aria-label="Interactive sphere of collection NFT images"
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="orb-gallery__canvas"
        aria-hidden="true"
      />
    </div>
  );
}
