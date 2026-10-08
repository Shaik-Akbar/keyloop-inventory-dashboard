interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalItems, pageSize, onChange }: PaginationProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <nav className="pagination" aria-label="Inventory pages">
      <span className="pagination__summary">
        {start}–{end} of {totalItems}
      </span>
      <div className="pagination__controls">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1}>
          ‹ Prev
        </button>
        <span className="pagination__page">
          Page {page} of {totalPages}
        </span>
        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
          Next ›
        </button>
      </div>
    </nav>
  );
}
