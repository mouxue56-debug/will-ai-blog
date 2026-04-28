// Timeline skeleton — matches breadcrumb + TodayFeedTeaser + TimelineYearIndexClient layout.
export default function TimelineLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16" aria-label="Loading" role="status">
      {/* Breadcrumb */}
      <div className="h-4 w-24 rounded skeleton-shimmer mb-8" />

      {/* Title + subtitle */}
      <div className="text-center mb-10 space-y-3">
        <div className="h-9 w-56 rounded-lg skeleton-shimmer mx-auto" />
        <div className="h-4 w-80 rounded skeleton-shimmer mx-auto" />
      </div>

      {/* TodayFeedTeaser skeleton */}
      <section className="py-8 sm:py-12">
        <div className="mb-5 flex items-end justify-between">
          <div className="h-7 w-32 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-16 rounded skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/30 bg-card/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full skeleton-shimmer" />
                <div className="h-3 w-20 rounded skeleton-shimmer" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 rounded w-full skeleton-shimmer" />
                <div className="h-4 rounded w-4/5 skeleton-shimmer" />
              </div>
              <div className="h-3 w-24 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </section>

      {/* Filter bar skeleton */}
      <div className="glass-card p-4 sm:p-5 mb-10">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-16 rounded-full skeleton-shimmer" />
          ))}
        </div>
      </div>

      {/* Year cards skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="h-6 w-24 rounded skeleton-shimmer" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full skeleton-shimmer mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 rounded w-3/4 skeleton-shimmer" />
                    <div className="h-3 rounded w-1/2 skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
