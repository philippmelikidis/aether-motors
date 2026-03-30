import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "tonal";
}

export default function Card({
  children,
  className,
  variant = "glass",
}: CardProps) {
  return (
    <div
      className={cn(
        variant === "glass"
          ? "glass-panel rounded-xl"
          : "tonal-shift rounded-xl border border-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}
