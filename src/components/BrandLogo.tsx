import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-white", className)}
      aria-hidden
    >
      {/* Cloud — uses currentColor (white) */}
      <path d="M6 16a4 4 0 0 1 .9-7.9 5.5 5.5 0 0 1 10.8 1.4A4 4 0 0 1 17 17H7a3.5 3.5 0 0 1-1-1z" />
      {/* Lightning bolt — neon yellow with glow */}
      <polygon
        points="13,11 9,17 12,17 11,22 15,16 12,16 13,11"
        fill="hsl(60 100% 60%)"
        stroke="hsl(60 100% 55%)"
        strokeWidth={1}
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 4px hsl(60 100% 60% / 0.9))" }}
      />
    </svg>
  );
}
