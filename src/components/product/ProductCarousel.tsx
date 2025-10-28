import { ProductCard, type ProductCardProps } from './ProductCard';

type ProductCarouselProps = {
  title: string;
  products: ProductCardProps['product'][];
  description?: string;
};

export function ProductCarousel({ title, description, products }: ProductCarouselProps) {
  if (!products.length) return null;

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </header>
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="w-[260px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
