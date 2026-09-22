import { FEE_SPLIT } from "@/lib/config";
import { cn } from "@/lib/format";

export function FeeSplitCallout({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-card border border-mop/25 bg-mop/5 px-4 py-3 text-sm text-snow",
        className,
      )}
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-mop/40 bg-void text-mop">
        <LockIcon />
      </span>
      <div>
        <p className="font-display text-[13px] font-semibold tracking-wide text-mop">
          Fee split locked: {FEE_SPLIT.sweep}% sweep wallet / {FEE_SPLIT.protocol}% Sweep
        </p>
        {!compact ? (
          <p className="mt-1 text-[13px] leading-relaxed text-fog">
            Set on pump.fun at launch, admin revoked. Sweep never holds fee authority. The
            sweep wallet buys the paired collection in public.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
