import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/api-utils";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return NextResponse.json({ orders });
}
