// Order API client — calls the Next.js proxy route which forwards to order-service.

export interface CheckoutAddress {
  street: string;
  zip: string;
  city: string;
  country: string;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
}

export interface CheckoutPayload {
  cartId: string;
  checkout: {
    customer: CheckoutCustomer;
    address: CheckoutAddress;
  };
}

export interface Order {
  id: string;
  status: "created" | "paid" | "cancelled";
  createdAt: string;
  cartReference: string;
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  items: unknown[];
  totals: {
    itemCount: number;
    subtotal: number;
    totalPrice: number;
  };
}

export const orderApi = {
  async place(payload: CheckoutPayload): Promise<Order> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error ?? `Order failed: ${res.status}`);
    }
    return (body.data ?? body) as Order;
  },
};
