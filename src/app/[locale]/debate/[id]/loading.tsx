// Debate detail skeleton — mirrors DebateDetailClient layout (back link, title, opinions).
export default function DebateDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16" aria-label="Loading" role="status">
      {/* Back link */}
      <div className="h-4 w-20 rounded mb-6 skeleton-shimmer" />

      {/* Title block */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          <div className="h-4 w-24 rounded skeleton-shimmer" />
        </div>
        <div className="h-8 rounded-lg w-4/5 skeleton-shimmer" />
        <div className="h-8 rounded-lg w-3/5 skeleton-shimmer" />
      </div>

      {/* News source card */}
      <div className="glass-card mb-6 overflow-hidden rounded-xl">
        <div className="px-4 py-3 space-y-2">
          <div className="h-3 rounded w-full skeleton-shimmer" />
          <div className="h-3 rounded w-11/12 skeleton-shimmer" />
        </div>
      </div>

      {/* Opinion cards */}
      <div className="space-y-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/30 bg-card/50 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full skeleton-shimmer" />
              <div className="h-4 w-24 rounded skeleton-shimmer" />
              <div className="h-5 w-14 rounded-full skeleton-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded w-full skeleton-shimmer" />
              <div className="h-3 rounded w-11/12 skeleton-shimmer" />
              <div className="h-3 rounded w-4/5 skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
