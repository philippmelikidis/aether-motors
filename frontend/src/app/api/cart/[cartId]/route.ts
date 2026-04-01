import { NextResponse } from "next/server";

const CART_SERVICE = process.env.CART_SERVICE_URL!;

// GET /api/cart/:cartId — fetch cart state
export async function GET(
  _req: Request,
  { params }: { params: { cartId: string } }
) {
  try {
    const res = await fetch(`${CART_SERVICE}/api/cart/${params.cartId}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "cart-service unavailable" }, { status: 503 });
  }
}

// DELETE /api/cart/:cartId — clear all items
export async function DELETE(
  _req: Request,
  { params }: { params: { cartId: string } }
) {
  try {
    const res = await fetch(`${CART_SERVICE}/api/cart/${params.cartId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "cart-service unavailable" }, { status: 503 });
  }
}
