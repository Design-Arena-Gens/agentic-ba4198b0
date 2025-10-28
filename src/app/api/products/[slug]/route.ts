import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  fetchExternalReviews,
  fetchExternalRecommendations,
} from "@/lib/external/catalog";

export async function GET(
  _request: Request,
  context: { params: { slug: string } }
) {
  const { slug } = context.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      category: true,
      brand: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const [externalReviews, externalRecommendations, relatedProducts] = await Promise.all([
    fetchExternalReviews(product.name),
    fetchExternalRecommendations(product.name),
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      orderBy: { rating: "desc" },
      take: 4,
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
        brand: true,
      },
    }),
  ]);

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      rating: product.rating,
      inventory: product.inventory,
      brand: product.brand.name,
      category: product.category.name,
      images: product.images,
      sku: product.sku,
    },
    reviews: product.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      reviewer: review.user?.name ?? review.reviewer,
      createdAt: review.createdAt,
    })),
    externalReviews,
    recommendations: [
      ...relatedProducts.map((item) => ({
        id: item.id,
        title: item.name,
        priceCents: item.priceCents,
        rating: item.rating,
        brand: item.brand.name,
        image: item.images[0]?.url ?? null,
        slug: item.slug,
      })),
      ...externalRecommendations.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        rating: item.rating,
        image: item.image,
        external: true,
      })),
    ],
  });
}
