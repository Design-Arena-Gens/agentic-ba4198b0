'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from './Button';

type PaginationProps = {
  page: number;
  totalPages: number;
};

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function setPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Product pagination">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </nav>
  );
}
