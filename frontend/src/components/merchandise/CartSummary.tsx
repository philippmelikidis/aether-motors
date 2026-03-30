import Image from "next/image";
import { CartItem } from "@/data/merchandise";

interface CartSummaryProps {
  items: CartItem[];
}

export default function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = 25.0;
  const total = subtotal + shipping;

  return (
    <div className="glass-card rounded-xl p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary">
          shopping_bag
        </span>
        <h3 className="font-headline font-bold text-white text-lg">
          Your Cart
        </h3>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-16 h-16 bg-surface-container-high rounded overflow-hidden relative shrink-0">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                {item.product.name}
              </p>
              {(item.size || item.variant) && (
                <p className="text-[10px] text-secondary uppercase tracking-widest">
                  {[item.size, item.variant].filter(Boolean).join(" / ")}
                </p>
              )}
              <p className="text-white text-sm mt-1">
                ${(item.product.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-6 mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Subtotal</span>
          <span className="text-white">
            ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Shipping</span>
          <span className="text-white">
            ${shipping.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold mt-2">
          <span className="text-white">Total</span>
          <span className="text-primary font-headline">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <button className="w-full py-4 bg-primary text-on-primary-container font-headline font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(0,218,248,0.4)] transition-shadow mt-6">
        Checkout Now
      </button>

      <p className="text-center text-[10px] text-secondary mt-3 tracking-widest uppercase">
        Secure Cloud-Native Payment
      </p>
    </div>
  );
}
