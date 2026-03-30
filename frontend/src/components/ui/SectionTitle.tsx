interface SectionTitleProps {
  label: string;
  title: string;
  description?: string;
}

export default function SectionTitle({
  label,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div>
      <p className="text-primary font-label text-xs tracking-[0.2em] uppercase font-bold mb-2">
        {label}
      </p>
      <h2 className="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter text-on-surface leading-none mb-6">
        {title}
      </h2>
      {description && (
        <p className="font-body text-secondary text-lg max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}
