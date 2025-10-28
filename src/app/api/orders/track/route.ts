import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/api-utils";
import { fetchShippingProgress } from "@/lib/external/catalog";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const { orderNumber } = body as { orderNumber?: string };

  if (!orderNumber) {
    return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, userId: user.id },
  });

  if (!order || !order.shippingTrackingId) {
    return NextResponse.json({ error: "No tracking available" }, { status: 404 });
  }

  const progress = await fetchShippingProgress(order.shippingTrackingId);
  return NextResponse.json({ progress });
}
