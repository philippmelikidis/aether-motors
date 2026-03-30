"use client";

import { useState } from "react";
import Image from "next/image";
import { products, categories, mockCartItems } from "@/data/merchandise";
import CategoryTabs from "@/components/merchandise/CategoryTabs";
import ProductCard from "@/components/merchandise/ProductCard";
import FeaturedCard from "@/components/merchandise/FeaturedCard";
import CartSummary from "@/components/merchandise/CartSummary";

export default function MerchandisePage() {
  const [activeCategory, setActiveCategory] = useState("New Arrivals");

  const filteredProducts =
    activeCategory === "New Arrivals"
      ? products
      : products.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        );

  const featuredProduct = filteredProducts.find((p) => p.featured);
  const regularProducts = filteredProducts.filter((p) => !p.featured);

  return (
    <div className="pt-32 pb-20 px-8 max-w-[1920px] mx-auto">
      {/* HERO SECTION */}
      <div className="grid grid-cols-12 gap-12 mb-20 items-end">
        <div className="col-span-7">
          <h1 className="font-headline text-6xl font-black uppercase tracking-tight text-white">
            Engineered
            <br />
            <span className="text-primary">Apparel</span>
          </h1>
          <p className="text-secondary font-body mt-4 max-w-lg">
            Performance-driven merchandise designed with the same precision
            engineering philosophy behind every Aether vehicle.
          </p>
        </div>
        <div className="col-span-5 flex justify-end">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-4 grid-rows-2 gap-8 mb-24">
        {featuredProduct && <FeaturedCard product={featuredProduct} />}
        {regularProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-8">
          <div className="tonal-shift h-64 rounded-xl relative overflow-hidden flex items-center">
            <div className="absolute right-0 top-0 w-1/2 h-full">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU97LLEAz9FZHtFN2Lp5mXDS_3xJBSRqWtSrRZ2o67ejre8HoDQTqNstF34vfY8rHbGhmgBdU6Tg7CINhHCN_8hNFyZwkBvBmH64ixrYFJfRcSPENmB1f8QuT8_AsOf4dhAIulrssyXkePNGoOXlg5RXnvvfaA5ZTwk-iJFTyK3-ym2M6aHEQ5QjMKPZTCpGVJZfukJ5PZIZnlV-0RnUNFkmW3xippA_PYY2xB_9xYyvYt7GNsHsmWfsphxPXo_ClOzq1raUH15mi4"
                alt="Aether vehicle"
                fill
                unoptimized
                className="object-cover opacity-30 mask-gradient-l"
              />
            </div>
            <div className="relative z-10 p-10">
              <p className="text-primary text-xs tracking-widest uppercase font-bold mb-2">
                Exclusive
              </p>
              <h2 className="font-headline text-3xl font-black text-white uppercase tracking-tight">
                Owner Perks
              </h2>
              <p className="text-secondary font-body mt-2 max-w-md">
                Zenith owners receive 20% off all merchandise. Link your vehicle
                to unlock exclusive pricing and limited-edition drops.
              </p>
              <button className="mt-4 px-6 py-3 border border-primary text-primary font-headline font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary/10 transition-colors">
                Link Vehicle
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <CartSummary items={mockCartItems} />
        </div>
      </div>
    </div>
  );
}
