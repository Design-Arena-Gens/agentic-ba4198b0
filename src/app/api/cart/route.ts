import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/api-utils";
import { cartItemSchema } from "@/lib/validators";

async function fetchCart(userId: number) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            orderBy: { isPrimary: "desc" },
            take: 1,
          },
          brand: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const subtotalCents = items.reduce(
    (acc, item) => acc + item.product.priceCents * item.quantity,
    0
  );

  return {
    items: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        priceCents: item.product.priceCents,
        rating: item.product.rating,
        brand: item.product.brand.name,
        image: item.product.images[0]?.url ?? null,
        inventory: item.product.inventory,
      },
    })),
    subtotalCents,
  };
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const cart = await fetchCart(user.id);
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (quantity > product.inventory) {
    return NextResponse.json({ error: "Quantity exceeds inventory" }, { status: 400 });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId: user.id, productId },
  });

  if (existing) {
    const newQuantity = Math.min(product.inventory, existing.quantity + quantity);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId,
        quantity,
      },
    });
  }

  const cart = await fetchCart(user.id);
  return NextResponse.json(cart, { status: 201 });
}
