"use client";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-6 py-3 font-headline font-bold uppercase tracking-widest text-xs transition-all ${
            cat === activeCategory
              ? "border-b-2 border-primary text-primary hover:bg-primary/5"
              : "text-secondary hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
