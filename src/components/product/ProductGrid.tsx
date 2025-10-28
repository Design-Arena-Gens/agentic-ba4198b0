import { ProductCard, type ProductCardProps } from './ProductCard';

type ProductGridProps = {
  products: ProductCardProps['product'][];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
        <p className="text-base font-semibold text-slate-800">No products match your filters</p>
        <p className="mt-1 text-sm text-muted">Try adjusting price, category, or brand filters.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
