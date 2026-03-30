import Image from "next/image";
import { Product } from "@/data/merchandise";

interface FeaturedCardProps {
  product: Product;
}

export default function FeaturedCard({ product }: FeaturedCardProps) {
  return (
    <div className="col-span-2 row-span-2 group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,218,248,0.1)]">
      <Image
        src={product.image}
        alt={product.name}
        fill
        unoptimized
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 p-8 w-full">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-primary text-xs tracking-widest uppercase">
              {product.category}
            </span>
            <h2 className="font-headline text-3xl font-bold text-white">
              {product.name}
            </h2>
            <p className="text-secondary text-sm font-body mt-1">
              {product.description}
            </p>
            <span className="font-headline font-bold text-white text-2xl mt-2 block">
              ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <button className="bg-primary w-14 h-14 rounded-full flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-on-primary-container">
              add_shopping_cart
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
