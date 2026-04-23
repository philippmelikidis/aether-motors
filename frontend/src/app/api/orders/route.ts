import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE = process.env.ORDER_SERVICE_URL ?? "http://localhost:3003";

// POST /api/orders — place an order { cartId, checkout: { customer, address } }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${ORDER_SERVICE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "order-service unavailable" }, { status: 503 });
  }
}
