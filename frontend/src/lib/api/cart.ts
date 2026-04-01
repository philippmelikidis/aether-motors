// Cart API client — calls the Next.js proxy routes which forward to cart-service.
// Backend integration point: swap base URL or fetch logic when deploying.
import { CartApiError } from "./errors";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  configuration: Record<string, unknown>;
  lineTotal: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  summary: CartSummary;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const payload = await res.json();
  if (!res.ok) {
    // cart-service sends { status: "error", message: "..." }
    const msg = payload?.message ?? payload?.error ?? `Request failed: ${res.status}`;
    throw new CartApiError(msg, res.status);
  }
  // cart-service wraps responses in { data: ... }
  return (payload.data ?? payload) as T;
}

export const cartApi = {
  create(): Promise<Cart> {
    return request<Cart>("/api/cart", { method: "POST" });
  },

  get(cartId: string): Promise<Cart> {
    return request<Cart>(`/api/cart/${cartId}`);
  },

  addItem(
    cartId: string,
    productId: string,
    quantity: number,
    configuration?: Record<string, unknown>
  ): Promise<CartItem> {
    return request<CartItem>(`/api/cart/${cartId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, configuration: configuration ?? {} }),
    });
  },

  updateItem(cartId: string, itemId: string, quantity: number): Promise<CartItem> {
    return request<CartItem>(`/api/cart/${cartId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem(cartId: string, itemId: string): Promise<Cart> {
    return request<Cart>(`/api/cart/${cartId}/items/${itemId}`, {
      method: "DELETE",
    });
  },

  clear(cartId: string): Promise<Cart> {
    return request<Cart>(`/api/cart/${cartId}`, { method: "DELETE" });
  },
};
