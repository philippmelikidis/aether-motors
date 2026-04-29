"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "@/components/merchandise/CheckoutModal";

export default function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    enrichedItems,
    cart,
    isLoading,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const shipping = enrichedItems.length > 0 ? 25 : 0;
  const subtotal = cart?.summary?.subtotal ?? 0;
  const total = subtotal + shipping;

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col bg-[#121314] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">shopping_bag</span>
            <h2 className="font-headline font-bold text-white text-lg uppercase tracking-tight">
              Your Cart
            </h2>
            {isLoading && (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center text-secondary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {enrichedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <span className="material-symbols-outlined text-secondary text-5xl">
                shopping_cart
              </span>
              <p className="text-secondary font-body text-sm">Your cart is empty.</p>
              <button
                onClick={closeDrawer}
                className="mt-2 text-primary text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {enrichedItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0 bg-surface-container-high">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-sm">
                          inventory_2
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-primary text-sm font-headline font-bold mt-0.5">
                      ${item.lineTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                        className="w-6 h-6 rounded border border-white/20 text-secondary hover:text-white hover:border-primary disabled:opacity-30 transition-colors text-sm flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="w-6 h-6 rounded border border-white/20 text-secondary hover:text-white hover:border-primary disabled:opacity-30 transition-colors text-sm flex items-center justify-center"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={isLoading}
                        className="ml-auto text-secondary hover:text-red-400 transition-colors disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only visible when cart has items */}
        {enrichedItems.length > 0 && (
          <div className="px-6 py-5 border-t border-white/10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Subtotal</span>
              <span className="text-white">
                ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Shipping</span>
              <span className="text-white">$25.00</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t border-white/5">
              <span className="text-white">Total</span>
              <span className="text-primary font-headline">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => {
                closeDrawer();
                setCheckoutOpen(true);
              }}
              disabled={isLoading}
              className="w-full py-4 bg-primary text-on-primary-container font-headline font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(0,218,248,0.4)] transition-shadow disabled:opacity-50 mt-1"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
