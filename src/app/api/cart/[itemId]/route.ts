import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse, notFoundResponse } from "@/lib/api-utils";
import { updateCartItemSchema } from "@/lib/validators";

async function fetchCart(userId: number) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
  });

  const subtotalCents = items.reduce(
    (acc, item) => acc + item.product.priceCents * item.quantity,
    0
  );

  return {
    items: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      productId: item.productId,
      priceCents: item.product.priceCents,
    })),
    subtotalCents,
  };
}

export async function PATCH(
  request: Request,
  context: { params: { itemId: string } }
) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const itemId = Number(context.params.itemId);
  if (Number.isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: user.id },
    include: { product: true },
  });

  if (!cartItem) {
    return notFoundResponse("Cart item");
  }

  const quantity = Math.min(cartItem.product.inventory, parsed.data.quantity);

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });

  const cart = await fetchCart(user.id);
  return NextResponse.json(cart);
}

export async function DELETE(
  _request: Request,
  context: { params: { itemId: string } }
) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const itemId = Number(context.params.itemId);
  if (Number.isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
  }

  await prisma.cartItem.deleteMany({
    where: { id: itemId, userId: user.id },
  });

  const cart = await fetchCart(user.id);
  return NextResponse.json(cart);
}
