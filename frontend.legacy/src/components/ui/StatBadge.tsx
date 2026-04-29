interface StatBadgeProps {
  label: string;
  value: string;
  unit: string;
}

export default function StatBadge({ label, value, unit }: StatBadgeProps) {
  return (
    <div>
      <span className="text-[10px] font-label uppercase tracking-widest text-secondary/40 mb-1 block">
        {label}
      </span>
      <span className="text-4xl font-headline font-bold text-white tracking-tighter">
        {value}
        <span className="text-primary text-xl">{unit}</span>
      </span>
    </div>
  );
}
