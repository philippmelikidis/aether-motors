"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { cartApi, Cart, CartItem } from "@/lib/api/cart";
import { CartApiError } from "@/lib/api/errors";
import { products } from "@/data/merchandise";

// Enrich cart items with image data from the local product catalog.
// When a product-service is available, this enrichment can be moved server-side.
function enrichItem(item: CartItem): CartItem & { image?: string } {
  const local = products.find((p) => p.id === item.productId);
  return { ...item, image: local?.image };
}

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  enrichedItems: (CartItem & { image?: string })[];
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_ID_KEY = "aether_cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Keep a ref so callbacks always see the latest cart without stale closures
  const cartRef = useRef<Cart | null>(null);
  cartRef.current = cart;

  // Promise that resolves once init has finished (avoids race with addToCart)
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Resolve or create a cart on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem(CART_ID_KEY);
        if (stored) {
          try {
            const existing = await cartApi.get(stored);
            setCart(existing);
            return;
          } catch (err) {
            // 404 = cart is gone (service restarted) → recreate below
            // anything else (503 etc.) = service down → stay offline
            if (!(err instanceof CartApiError && err.status === 404)) {
              return;
            }
            localStorage.removeItem(CART_ID_KEY);
            setCart(null); // clear stale cart from state so ref no longer points to old ID
          }
        }
        const fresh = await cartApi.create();
        localStorage.setItem(CART_ID_KEY, fresh.id);
        setCart(fresh);
      } catch {
        // cart-service is offline — offline mode, null cart
      } finally {
        setIsLoading(false);
      }
    }
    initPromiseRef.current = init();
  }, []);

  /**
   * Ensures we have a valid cart ID.
   * If the service restarted and our cart is gone (404), creates a fresh one.
   */
  const ensureCart = useCallback(async (): Promise<Cart> => {
    // Wait for init to finish so we don't create duplicate carts
    if (initPromiseRef.current) {
      await initPromiseRef.current;
    }
    const current = cartRef.current;
    if (current) return current;
    // No cart in state — create one now
    const fresh = await cartApi.create();
    localStorage.setItem(CART_ID_KEY, fresh.id);
    setCart(fresh);
    return fresh;
  }, []);

  /**
   * Runs a cart operation. If it gets a 404 specifically for a missing cart
   * (stale ID after service restart), recreates the cart and retries once.
   * Other 404s (e.g. product not found) or 422s are NOT retried.
   */
  const withCartRetry = useCallback(
    async (fn: (cartId: string) => Promise<Cart | CartItem>) => {
      const current = await ensureCart();
      try {
        return await fn(current.id);
      } catch (err) {
        // Only retry when the *cart itself* is gone (404 with "Cart not found").
        // Product-related errors (422 / other messages) should not trigger a retry.
        const isCartGone =
          err instanceof CartApiError &&
          err.status === 404 &&
          /cart not found/i.test(err.message);
        if (isCartGone) {
          localStorage.removeItem(CART_ID_KEY);
          const fresh = await cartApi.create();
          localStorage.setItem(CART_ID_KEY, fresh.id);
          setCart(fresh);
          return await fn(fresh.id);
        }
        throw err;
      }
    },
    [ensureCart]
  );

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      setIsLoading(true);
      try {
        // Capture the cartId actually used — may differ from cartRef after a retry
        let activeCartId = cartRef.current?.id;
        await withCartRetry((id) => {
          activeCartId = id;
          return cartApi.addItem(id, productId, quantity);
        });
        if (activeCartId) {
          const updated = await cartApi.get(activeCartId);
          setCart(updated);
        }
      } catch (err) {
        // 503 = service down → stay silent. Anything else is worth logging.
        if (err instanceof CartApiError && err.status !== 503) {
          console.warn("[Cart] addToCart failed:", err.message, `(${err.status})`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [withCartRetry]
  );

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!cartRef.current) return;
    setIsLoading(true);
    try {
      const updated = await cartApi.removeItem(cartRef.current.id, itemId) as Cart;
      setCart(updated);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const id = cartRef.current?.id;
    if (!id) return;
    setIsLoading(true);
    try {
      await cartApi.updateItem(id, itemId, quantity);
      const updated = await cartApi.get(id);
      setCart(updated);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    if (!cartRef.current) return;
    setIsLoading(true);
    try {
      const updated = await cartApi.clear(cartRef.current.id) as Cart;
      setCart(updated);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const enrichedItems = (cart?.items ?? []).map(enrichItem);
  const itemCount = cart?.summary?.itemCount ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        enrichedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
