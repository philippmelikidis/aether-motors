"use client";

import Image from "next/image";
import { Product } from "@/data/merchandise";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();

  async function handleAdd() {
    await addToCart(product.id);
  }

  return (
    <div className="group bg-surface-container-low rounded-xl overflow-hidden border-b-2 border-transparent hover:border-primary transition-all duration-300">
      <div className="aspect-square relative overflow-hidden bg-surface-container-high">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="25vw"
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          unoptimized
        />
        {product.badge && (
          <span className="absolute top-4 right-4 bg-surface-dim/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter text-primary">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-headline font-bold text-lg text-white mb-1">
          {product.name}
        </h3>
        <p className="text-secondary text-sm font-body mb-4">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-headline font-bold text-white">
            ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button
            onClick={handleAdd}
            disabled={isLoading}
            className="text-primary hover:underline font-label text-xs font-bold uppercase tracking-widest disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
