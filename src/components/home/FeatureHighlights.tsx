const highlights = [
  {
    title: 'Personalized journeys',
    description: 'Discover products aligned to your taste with dynamic search, filtering, and AI-backed recommendations.',
    icon: '🎯',
  },
  {
    title: 'Unified commerce',
    description: 'Secure authentication, persistent carts, and saved addresses keep your essentials one tap away.',
    icon: '🔐',
  },
  {
    title: 'Responsive everywhere',
    description: 'Crafted with a fluid grid, optimized media, and motion to delight on mobile, tablet, and desktop.',
    icon: '📱',
  },
  {
    title: 'Real-time visibility',
    description: 'Track shipments, review order history, and view aggregated reviews from trusted third parties.',
    icon: '📦',
  },
];

export function FeatureHighlights() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {highlights.map((item) => (
        <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-2xl">
            <span aria-hidden>{item.icon}</span>
            <span className="sr-only">{item.title}</span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm text-muted">{item.description}</p>
        </article>
      ))}
    </section>
  );
}
