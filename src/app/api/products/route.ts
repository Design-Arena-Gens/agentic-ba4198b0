import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { productFilterSchema } from "@/lib/validators";

const PAGE_SIZE = 16;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = productFilterSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = "1",
    pageSize,
  } = parsed.data;

  const currentPage = Math.max(1, Number(page));
  const size = Math.min(48, Number(pageSize ?? PAGE_SIZE));

  const filters: any = {};

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    filters.category = { slug: category };
  }

  if (brand) {
    filters.brand = { slug: brand };
  }

  const minPriceValue = minPrice ? Number(minPrice) : undefined;
  const maxPriceValue = maxPrice ? Number(maxPrice) : undefined;

  if (minPriceValue || maxPriceValue) {
    filters.priceCents = {};
    if (minPriceValue && !Number.isNaN(minPriceValue)) {
      filters.priceCents.gte = Math.round(minPriceValue * 100);
    }
    if (maxPriceValue && !Number.isNaN(maxPriceValue)) {
      filters.priceCents.lte = Math.round(maxPriceValue * 100);
    }
  }

  const ratingValue = rating ? Number(rating) : undefined;
  if (ratingValue && !Number.isNaN(ratingValue)) {
    filters.rating = { gte: ratingValue };
  }

  let orderBy: any = { createdAt: "desc" };

  switch (sort) {
    case "price-asc":
      orderBy = { priceCents: "asc" };
      break;
    case "price-desc":
      orderBy = { priceCents: "desc" };
      break;
    case "rating-desc":
      orderBy = { rating: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: filters,
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
        category: true,
        brand: true,
      },
      orderBy,
      skip: (currentPage - 1) * size,
      take: size,
    }),
    prisma.product.count({ where: filters }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      rating: product.rating,
      brand: product.brand.name,
      category: product.category.name,
      image: product.images[0]?.url ?? null,
      inventory: product.inventory,
    })),
    pagination: {
      page: currentPage,
      pageSize: size,
      total,
      totalPages,
    },
    filters: {
      categories,
      brands,
      priceRange: {
        min: Math.min(...products.map((p) => p.priceCents), 0),
        max: Math.max(...products.map((p) => p.priceCents), 0),
      },
    },
  });
}
