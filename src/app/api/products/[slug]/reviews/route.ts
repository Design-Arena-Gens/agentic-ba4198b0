import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/api-utils";
import { reviewSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  context: { params: { slug: string } }
) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const product = await prisma.product.findUnique({ where: { slug: context.params.slug } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({
    where: { productId: product.id, userId: user.id },
  });

  let review;
  if (existing) {
    review = await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        reviewer: user.name,
      },
    });
  } else {
    review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        reviewer: user.name,
      },
    });
  }

  const average = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { rating: average._avg.rating ?? product.rating },
  });

  return NextResponse.json({ review });
}
