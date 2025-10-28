import prisma from '@/lib/prisma';
import { HeroBanner } from '@/components/home/HeroBanner';
import { FeatureHighlights } from '@/components/home/FeatureHighlights';
import { ProductCarousel } from '@/components/product/ProductCarousel';

async function fetchProducts() {
  const [featured, trending, valuePicks] = await Promise.all([
    prisma.product.findMany({
      orderBy: { rating: 'desc' },
      take: 8,
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        brand: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        brand: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { priceCents: 'asc' },
      take: 6,
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        brand: true,
      },
    }),
  ]);

  const mapProduct = (product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceCents: product.priceCents,
    rating: product.rating,
    brand: product.brand.name,
    image: product.images[0]?.url ?? null,
    inventory: product.inventory,
  });

  return {
    featured: featured.map(mapProduct),
    trendingNow: trending.map(mapProduct),
    valuePicks: valuePicks.map(mapProduct),
  };
}

export default async function HomePage() {
  const { featured, trendingNow, valuePicks } = await fetchProducts();

  return (
    <div className="space-y-14">
      <HeroBanner />
      <FeatureHighlights />
      <ProductCarousel
        title="Featured this week"
        description="Top-rated products chosen by our community and trusted reviewers."
        products={featured}
      />
      <ProductCarousel
        title="Fresh arrivals"
        description="New products that just landed in our catalog."
        products={trendingNow}
      />
      <ProductCarousel
        title="Value picks"
        description="Premium quality without the premium price tag."
        products={valuePicks}
      />
    </div>
  );
}
