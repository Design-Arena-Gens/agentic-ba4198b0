import Link from 'next/link';
import Image from 'next/image';
import { toPriceString } from '@/lib/currency';
import { RatingStars } from './RatingStars';

type InternalRecommendation = {
  id: number;
  title: string;
  slug: string;
  priceCents: number;
  rating: number;
  image: string | null;
  brand: string;
};

type ExternalRecommendation = {
  id: number;
  title: string;
  price: number;
  rating: number;
  image: string;
  external: true;
};

type RecommendationCarouselProps = {
  recommendations: Array<InternalRecommendation | ExternalRecommendation>;
};

function isExternal(
  recommendation: InternalRecommendation | ExternalRecommendation
): recommendation is ExternalRecommendation {
  return (recommendation as ExternalRecommendation).external === true;
}

export function RecommendationCarousel({ recommendations }: RecommendationCarouselProps) {
  if (!recommendations.length) return null;

  return (
    <section className="space-y-4">
      <header>
        <h3 className="text-xl font-semibold text-slate-900">Recommended for you</h3>
        <p className="text-sm text-muted">Handpicked alternatives based on viewing patterns.</p>
      </header>
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex gap-4">
          {recommendations.map((item) => (
            <article
              key={`${item.id}-${isExternal(item) ? 'external' : 'internal'}`}
              className="w-[240px] flex-shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-slate-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    Image unavailable
                  </div>
                )}
              </div>
              <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</h4>
              <RatingStars rating={item.rating} size="sm" showLabel={false} className="mt-2" />
              <p className="mt-2 text-base font-bold text-slate-900">
                {isExternal(item) ? `$${item.price.toFixed(2)}` : toPriceString(item.priceCents)}
              </p>
              <div className="mt-3">
                {isExternal(item) ? (
                  <a
                    href={`https://dummyjson.com/products/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    View external listing
                  </a>
                ) : (
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    View details
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
