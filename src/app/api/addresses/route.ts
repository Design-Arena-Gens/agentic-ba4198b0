import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/api-utils";
import { addressSchema } from "@/lib/validators";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const data = parsed.data;

  const address = await prisma.address.create({
    data: {
      ...data,
      userId: user.id,
    },
  });

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId: user.id,
        NOT: { id: address.id },
      },
      data: { isDefault: false },
    });
  }

  return NextResponse.json({ address }, { status: 201 });
}
