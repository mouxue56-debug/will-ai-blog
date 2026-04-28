// Home page skeleton — shimmer style consistent with other route loading files.
export default function Loading() {
  return (
    <div className="w-full" aria-label="Loading" role="status">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-12">
        <div className="h-10 rounded-lg w-72 mb-4 skeleton-shimmer" />
        <div className="h-5 rounded-lg w-96 mb-2 skeleton-shimmer" />
        <div className="h-5 rounded-lg w-64 skeleton-shimmer" />
      </div>

      {/* Content sections skeleton */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12 pb-16">
        <div className="space-y-3">
          <div className="h-7 rounded-lg w-40 skeleton-shimmer" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/30 bg-card/50 p-4 space-y-3">
                <div className="h-4 rounded w-3/4 skeleton-shimmer" />
                <div className="h-3 rounded w-full skeleton-shimmer" />
                <div className="h-3 rounded w-5/6 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
