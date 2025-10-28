import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse, notFoundResponse } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  context: { params: { orderNumber: string } }
) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber: context.params.orderNumber, userId: user.id },
    include: {
      items: true,
      address: true,
    },
  });

  if (!order) {
    return notFoundResponse("Order");
  }

  return NextResponse.json({ order });
}
