import { NextRequest, NextResponse } from "next/server";

const CART_SERVICE = process.env.CART_SERVICE_URL ?? "http://localhost:3002";

// PATCH /api/cart/:cartId/items/:itemId — update quantity { quantity }
export async function PATCH(
  req: NextRequest,
  { params }: { params: { cartId: string; itemId: string } }
) {
  try {
    const body = await req.json();
    const res = await fetch(
      `${CART_SERVICE}/api/cart/${params.cartId}/items/${params.itemId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "cart-service unavailable" }, { status: 503 });
  }
}

// DELETE /api/cart/:cartId/items/:itemId — remove item
export async function DELETE(
  _req: Request,
  { params }: { params: { cartId: string; itemId: string } }
) {
  try {
    const res = await fetch(
      `${CART_SERVICE}/api/cart/${params.cartId}/items/${params.itemId}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "cart-service unavailable" }, { status: 503 });
  }
}
