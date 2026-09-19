"use client";

import { OrbGallery } from "@/src/shaders/orb-gallery/OrbGallery";
import "./hero-gallery.css";

export function HeroGallery() {
  return (
    <div className="shader-frame">
      <OrbGallery />
    </div>
  );
}
