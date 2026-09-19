"use client";

import { useState, type ReactNode } from "react";

export function LandingPulse() {
  const [pressure, setPressure] = useState(62);

  return (
    <div className="flex h-full flex-col justify-center gap-4 px-5 py-5 text-snow md:px-6">
      <PulseRow
        icon={<SparkIcon />}
        label="Sweep share"
        value="80%"
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[13px] font-medium text-snow/90">
            <BoltIcon />
            Floor pressure
          </span>
          <span className="font-editorial text-sm text-mop">{pressure}%</span>
        </div>
        <input
          className="ff-range"
          type="range"
          min={8}
          max={100}
          value={pressure}
          aria-label="Floor pressure"
          style={{ ["--p" as string]: `${pressure}%` }}
          onChange={(event) => setPressure(Number(event.target.value))}
        />
      </div>
      <PulseRow icon={<ScaleIcon />} label="Protocol cut" value="20%" muted />
    </div>
  );
}

function PulseRow({
  icon,
  label,
  value,
  muted = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <span className="inline-flex items-center gap-2 text-[13px] font-medium text-snow/90">
        {icon}
        {label}
      </span>
      <span className={muted ? "text-sm text-fog" : "font-editorial text-sm text-mop"}>{value}</span>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.2 6.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 3 5 13h7l-1 8 8-10h-7l1-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v16M4 8h16M7 8l-3 6h6L7 8Zm10 0-3 6h6l-3-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
