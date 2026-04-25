// Debate list skeleton — matches the debate page banner + masonry card layout.
export default function DebateLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12" aria-label="Loading" role="status">
      {/* Banner skeleton */}
      <div className="glass-card mb-6 overflow-hidden rounded-3xl">
        <div className="relative h-40 sm:h-48 skeleton-shimmer">
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 gap-3">
            <div className="h-9 rounded-lg w-48 skeleton-shimmer" />
            <div className="h-4 rounded-lg w-72 skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Guide skeleton */}
      <div className="h-10 rounded-xl w-full max-w-md mx-auto mb-6 skeleton-shimmer" />

      {/* Card grid skeleton */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid rounded-xl border border-border/30 bg-card/50 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 rounded-full skeleton-shimmer" />
                <div className="h-4 w-24 rounded skeleton-shimmer" />
              </div>
              <div className="h-5 rounded w-4/5 skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-3 rounded w-full skeleton-shimmer" />
                <div className="h-3 rounded w-11/12 skeleton-shimmer" />
                <div className="h-3 rounded w-4/5 skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
