"use client";

interface PriceSummaryProps {
  basePrice: number;
  optionsPrice: number;
}

export default function PriceSummary({
  basePrice,
  optionsPrice,
}: PriceSummaryProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const total = basePrice + optionsPrice;

  return (
    <div className="glass-panel rounded-2xl p-5 border-t-2 border-primary/30">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-secondary/60 uppercase tracking-wider">
            Base Price
          </span>
          <span className="text-sm font-bold text-on-surface">
            {formatPrice(basePrice)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-secondary/60 uppercase tracking-wider">
            Options
          </span>
          <span className="text-sm font-bold text-on-surface">
            {formatPrice(optionsPrice)}
          </span>
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex justify-between items-center">
          <span className="text-xs text-secondary/60 uppercase tracking-wider">
            Total
          </span>
          <span className="text-2xl font-headline font-black text-on-surface">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <button className="btn-primary primary-glow w-full py-4 mt-5 text-sm font-bold uppercase tracking-widest">
        Kaufen
      </button>

      <p className="text-[10px] text-secondary/40 text-center mt-3">
        Estimated delivery: Q4 2025. Financing available.
      </p>
    </div>
  );
}
