import { cn } from "@/lib/utils";

interface IconButtonProps {
  icon: string;
  onClick?: () => void;
  className?: string;
}

export default function IconButton({ icon, onClick, className }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-12 h-12 rounded-full glass-panel border border-white/10 flex items-center justify-center text-white hover:text-primary transition-colors",
        className
      )}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
