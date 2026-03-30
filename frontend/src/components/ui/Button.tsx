import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<string, string> = {
  primary: "btn-primary primary-glow",
  secondary: "btn-secondary",
  outline:
    "border border-outline-variant text-white font-label text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all",
  ghost:
    "text-primary hover:underline font-label text-xs font-bold uppercase tracking-widest",
};

const sizeStyles: Record<string, string> = {
  sm: "py-2 px-4",
  md: "py-3 px-6",
  lg: "py-4 px-8",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        variantStyles[variant],
        variant === "primary" && size === "lg"
          ? "py-4 px-8"
          : sizeStyles[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
