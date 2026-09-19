import { LaunchWizard } from "@/components/LaunchWizard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Launch" };

export default function LaunchPage() {
  return (
    <div className="space-y-6">
      <p className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-fog">
        Launch wizard
      </p>
      <LaunchWizard />
    </div>
  );
}
