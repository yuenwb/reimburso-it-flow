
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        {
          "h-4 w-4 border-2": size === "sm",
          "h-6 w-6 border-2": size === "md",
          "h-8 w-8 border-4": size === "lg",
        },
        "text-primary",
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
