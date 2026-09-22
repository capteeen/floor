import { appConfig } from "@/lib/config";
import { cn } from "@/lib/format";

export function TwitterLink({
  className,
  variant = "text",
}: {
  className?: string;
  variant?: "text" | "icon" | "landing";
}) {
  const label = `Sweep on X, ${appConfig.twitterHandle}`;

  if (variant === "text") {
    return (
      <a
        href={appConfig.twitterUrl}
        target="_blank"
        rel="noreferrer"
        className={cn("hover:text-mop", className)}
      >
        X
      </a>
    );
  }

  return (
    <a
      href={appConfig.twitterUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={cn(
        variant === "landing"
          ? "grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8 text-snow backdrop-blur-md transition duration-200 ease-out hover:bg-white/14 hover:text-mop"
          : "grid h-10 w-10 place-items-center rounded-btn border border-line text-fog transition duration-brand hover:border-mop/50 hover:text-mop",
        className,
      )}
    >
      <XIcon />
    </a>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.726-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
