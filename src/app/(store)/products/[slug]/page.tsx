import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductOverview } from '@/components/product/ProductOverview';
import { ReviewList } from '@/components/product/ReviewList';
import { ProductReviewForm } from '@/components/product/ProductReviewForm';
import { RecommendationCarousel } from '@/components/product/RecommendationCarousel';
import {
  fetchExternalRecommendations,
  fetchExternalReviews,
} from '@/lib/external/catalog';

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      },
      brand: true,
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const [externalReviews, externalRecommendations, relatedProducts] = await Promise.all([
    fetchExternalReviews(product.name),
    fetchExternalRecommendations(product.name),
    prisma.product.findMany({
      where: { categoryId: product.categoryId, NOT: { id: product.id } },
      orderBy: { rating: 'desc' },
      take: 6,
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        brand: true,
      },
    }),
  ]);

  const recommendations = [
    ...relatedProducts.map((item) => ({
      id: item.id,
      title: item.name,
      slug: item.slug,
      priceCents: item.priceCents,
      rating: item.rating,
      image: item.images[0]?.url ?? null,
      brand: item.brand.name,
    })),
    ...externalRecommendations.map((item) => ({
      ...item,
      external: true as const,
    })),
  ];

  const reviewData = product.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    reviewer: review.user?.name ?? review.reviewer,
    createdAt: review.createdAt,
  }));

  return (
    <div className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProductImageGallery
          images={product.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
          title={product.name}
        />
        <ProductOverview
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            priceCents: product.priceCents,
            rating: product.rating,
            brand: product.brand.name,
            category: product.category.name,
            inventory: product.inventory,
            image: product.images[0]?.url ?? null,
          }}
          reviewCount={product.reviews.length}
          externalReviewCount={externalReviews.length}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ReviewList reviews={reviewData} externalReviews={externalReviews} />
        <ProductReviewForm productSlug={product.slug} />
      </div>

      <RecommendationCarousel recommendations={recommendations} />
    </div>
  );
}
