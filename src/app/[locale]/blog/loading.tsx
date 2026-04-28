// Blog list skeleton — card grid matches the real layout.
export default function BlogListLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16" aria-label="Loading" role="status">
      <div className="mb-10">
        <div className="h-9 rounded-lg w-48 mb-3 skeleton-shimmer" />
        <div className="h-5 rounded-lg w-72 skeleton-shimmer" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/30 bg-card/50 overflow-hidden"
          >
            <div className="h-40 skeleton-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-4 rounded w-3/4 skeleton-shimmer" />
              <div className="h-3 rounded w-1/2 skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-3 rounded w-full skeleton-shimmer" />
                <div className="h-3 rounded w-5/6 skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
