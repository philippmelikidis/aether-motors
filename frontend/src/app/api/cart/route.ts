import { NextResponse } from "next/server";

const CART_SERVICE = process.env.CART_SERVICE_URL!;

// POST /api/cart — create a new cart
export async function POST() {
  try {
    const res = await fetch(`${CART_SERVICE}/api/cart`, { method: "POST" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "cart-service unavailable" }, { status: 503 });
  }
}
