import { cn } from "@/lib/format";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Floorfi home">
      <img
        src="/svg/floorfi-mark.svg"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-[8px] ring-1 ring-line"
      />
      {compact ? null : (
        <span className="font-display text-[22px] font-bold leading-none tracking-tight text-snow">
          floorfi
        </span>
      )}
    </Link>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const styles = {
    primary:
      "bg-mop text-void hover:bg-mop-dim disabled:bg-line disabled:text-fog",
    secondary:
      "border border-line bg-transparent text-snow hover:border-mop/50 hover:text-mop",
    ghost: "text-fog hover:text-snow",
  }[variant];

  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2.5 font-display text-sm font-semibold transition duration-brand disabled:cursor-not-allowed",
    styles,
    className,
  );

  if (href && !disabled) {
    const external = href.startsWith("http");
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
