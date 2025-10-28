import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse, notFoundResponse } from "@/lib/api-utils";
import { addressSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const addressId = Number(context.params.id);
  if (Number.isNaN(addressId)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = addressSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });

  if (!existing) {
    return notFoundResponse("Address");
  }

  const address = await prisma.address.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId: user.id,
        NOT: { id: address.id },
      },
      data: { isDefault: false },
    });
  }

  return NextResponse.json({ address });
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const addressId = Number(context.params.id);
  if (Number.isNaN(addressId)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  await prisma.address.deleteMany({ where: { id: addressId, userId: user.id } });

  return NextResponse.json({ success: true });
}
