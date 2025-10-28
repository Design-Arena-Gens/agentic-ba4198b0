import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { productFilterSchema } from '@/lib/validators';
import { FilterPanel } from '@/components/product/FilterPanel';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';

type ProductsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const normalized = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value ?? ''])
  );

  const parsed = productFilterSchema.safeParse(normalized);

  if (!parsed.success) {
    throw new Error('Invalid filters');
  }

  const { search, category, brand, minPrice, maxPrice, rating, sort, page = '1', pageSize } = parsed.data;
  const currentPage = Math.max(1, Number(page));
  const size = Math.min(48, Number(pageSize ?? '16') || 16);

  const filters: any = {};

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
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

  if (!Number.isNaN(minPriceValue) && minPriceValue) {
    filters.priceCents = { ...(filters.priceCents ?? {}), gte: Math.round(minPriceValue * 100) };
  }

  if (!Number.isNaN(maxPriceValue) && maxPriceValue) {
    filters.priceCents = { ...(filters.priceCents ?? {}), lte: Math.round(maxPriceValue * 100) };
  }

  const ratingValue = rating ? Number(rating) : undefined;
  if (!Number.isNaN(ratingValue) && ratingValue) {
    filters.rating = { gte: ratingValue };
  }

  let orderBy: any = { createdAt: 'desc' };

  switch (sort) {
    case 'price-asc':
      orderBy = { priceCents: 'asc' };
      break;
    case 'price-desc':
      orderBy = { priceCents: 'desc' };
      break;
    case 'rating-desc':
      orderBy = { rating: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: filters,
      orderBy,
      skip: (currentPage - 1) * size,
      take: size,
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        brand: true,
      },
    }),
    prisma.product.count({ where: filters }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  const productData = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceCents: product.priceCents,
    rating: product.rating,
    brand: product.brand.name,
    image: product.images[0]?.url ?? null,
    inventory: product.inventory,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Loading filters…</div>}>
        <FilterPanel categories={categories} brands={brands} />
      </Suspense>
      <div className="space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Browse products</h1>
          <p className="text-sm text-muted">
            Showing {productData.length} of {total} result(s){search ? ` for “${search}”` : ''}.
          </p>
        </header>
        <ProductGrid products={productData} />
        <Pagination page={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
