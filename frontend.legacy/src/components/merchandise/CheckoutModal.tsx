"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { orderApi, Order } from "@/lib/api/orders";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { cart, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "success" | "error">("form");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    street: "",
    zip: "",
    city: "",
    country: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const order = await orderApi.place({
        cartId: cart.id,
        checkout: {
          customer: { name: form.name, email: form.email },
          address: {
            street: form.street,
            zip: form.zip,
            city: form.city,
            country: form.country,
          },
        },
      });
      setPlacedOrder(order);
      setStep("success");
      await clearCart();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Order failed. Please try again.");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setStep("form");
    setPlacedOrder(null);
    setErrorMsg("");
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="glass-card border border-white/10 rounded-2xl w-full max-w-lg p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-secondary hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* FORM */}
        {step === "form" && (
          <>
            <h2 className="font-headline text-2xl font-black uppercase text-white mb-1">
              Checkout
            </h2>
            <p className="text-secondary text-sm mb-6 font-body">
              Complete your order — delivered anywhere in the world.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <Field label="Street Address" name="street" value={form.street} onChange={handleChange} required />
              <div className="grid grid-cols-3 gap-4">
                <Field label="ZIP" name="zip" value={form.zip} onChange={handleChange} required />
                <div className="col-span-2">
                  <Field label="City" name="city" value={form.city} onChange={handleChange} required />
                </div>
              </div>
              <Field label="Country" name="country" value={form.country} onChange={handleChange} required />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-on-primary-container font-headline font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(0,218,248,0.4)] transition-shadow mt-2 disabled:opacity-50"
              >
                {isSubmitting ? "Placing Order…" : "Place Order"}
              </button>
            </form>
          </>
        )}

        {/* SUCCESS */}
        {step === "success" && placedOrder && (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
            <h2 className="font-headline text-2xl font-black uppercase text-white mt-4">
              Order Confirmed
            </h2>
            <p className="text-secondary text-sm mt-2 font-body">
              Order <span className="text-primary font-bold">{placedOrder.id}</span> placed successfully.
            </p>
            <p className="text-secondary text-sm mt-1 font-body">
              Confirmation will be sent to <span className="text-white">{placedOrder.customer?.email}</span>
            </p>
            <button
              onClick={handleClose}
              className="mt-8 px-8 py-3 border border-primary text-primary font-headline font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary/10 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
            <h2 className="font-headline text-2xl font-black uppercase text-white mt-4">
              Order Failed
            </h2>
            <p className="text-secondary text-sm mt-2 font-body">{errorMsg}</p>
            <button
              onClick={() => setStep("form")}
              className="mt-8 px-8 py-3 border border-primary text-primary font-headline font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Small reusable input field for the form
function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-secondary uppercase tracking-widest mb-1 font-headline">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/40"
      />
    </div>
  );
}
