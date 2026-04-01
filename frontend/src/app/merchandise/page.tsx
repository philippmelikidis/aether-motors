"use client";

import { useState } from "react";
import Image from "next/image";
import { products, categories } from "@/data/merchandise";
import CategoryTabs from "@/components/merchandise/CategoryTabs";
import ProductCard from "@/components/merchandise/ProductCard";
import FeaturedCard from "@/components/merchandise/FeaturedCard";
import { useCart } from "@/context/CartContext";

export default function MerchandisePage() {
  const [activeCategory, setActiveCategory] = useState("New Arrivals");
  const { enrichedItems, cart, openDrawer } = useCart();

  const filteredProducts =
    activeCategory === "New Arrivals"
      ? products
      : products.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );

  const featuredProduct = filteredProducts.find((p) => p.featured);
  const regularProducts = filteredProducts.filter((p) => !p.featured);

  const subtotal = cart?.summary?.subtotal ?? 0;
  const shipping = enrichedItems.length > 0 ? 25 : 0;
  const total = subtotal + shipping;

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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU97LLEAz9FZHtFN2Lp5mXDS_3xJBSRqWtSrRZ2o67ejre8HoDQTqNstF34vfY8rHbGhmgBdU6Tg7CINhHCN_8hNFyZwkBvBmH64ixrYFJfRcSPENmB1f8QuT8_AsOf4dhAIulrssyXkePNGoOXlg5RXnvvfaA5ZTwk-iJFTyK3-ym2M6aHEQ5QjMKPZTCpGVJZfukJ5PZIZnlV-0RnUNFkmW3xippA_PYY2xB_9xYyvYt7GNsHsmWfsphxPXo_ClOzq1raUH15mi4=w2048"
                alt="Aether vehicle"
                fill
                sizes="33vw"
                className="object-cover opacity-30 mask-gradient-l"
                unoptimized
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
          {/* Mini cart summary */}
          <div className="glass-card rounded-xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">shopping_bag</span>
              <h3 className="font-headline font-bold text-white text-lg">Your Cart</h3>
            </div>

            {enrichedItems.length === 0 ? (
              <p className="text-secondary text-sm font-body">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {enrichedItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-surface-container-high rounded overflow-hidden relative shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.name}</p>
                        <p className="text-white text-xs">
                          ${item.lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {enrichedItems.length > 3 && (
                    <p className="text-secondary text-xs">+{enrichedItems.length - 3} more items</p>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Subtotal</span>
                    <span className="text-white">${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Shipping</span>
                    <span className="text-white">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2">
                    <span className="text-white">Total</span>
                    <span className="text-primary font-headline">${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  onClick={openDrawer}
                  className="w-full py-4 bg-primary text-on-primary-container font-headline font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(0,218,248,0.4)] transition-shadow mt-6"
                >
                  View Cart
                </button>
              </>
            )}

            <p className="text-center text-[10px] text-secondary mt-3 tracking-widest uppercase">
              Secure Cloud-Native Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
