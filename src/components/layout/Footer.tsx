export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900">ShopVerse</p>
          <p className="mt-1 max-w-md text-sm text-muted">
            Crafted for modern commerce with accessible design, secure checkout, and personalized discovery.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a href="#" className="hover:text-brand">
            Privacy
          </a>
          <a href="#" className="hover:text-brand">
            Terms
          </a>
          <a href="#" className="hover:text-brand">
            Accessibility
          </a>
          <a href="#" className="hover:text-brand">
            Help Center
          </a>
        </nav>
        <p>&copy; {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
      </div>
    </footer>
  );
}
