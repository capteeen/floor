import { SweepGallery } from "@/components/SweepGallery";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sweeps" };

export default function SweepsPage() {
  return <SweepGallery />;
}
