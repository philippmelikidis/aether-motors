import { NextRequest, NextResponse } from "next/server";

const CART_SERVICE = process.env.CART_SERVICE_URL!;

// POST /api/cart/:cartId/items — add item { productId, quantity, configuration? }
export async function POST(
  req: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const body = await req.json();
    const res = await fetch(`${CART_SERVICE}/api/cart/${params.cartId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "cart-service unavailable" }, { status: 503 });
  }
}
