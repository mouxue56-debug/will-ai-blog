export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 animate-pulse">
      {/* Title skeleton */}
      <div className="mb-10">
        <div className="h-9 bg-muted/60 rounded-lg w-48 mb-3" />
        <div className="h-5 bg-muted/40 rounded-lg w-72" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/30 bg-card/50 overflow-hidden">
            {/* Image placeholder */}
            <div className="h-40 bg-muted/40" />
            {/* Text placeholder */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted/50 rounded w-3/4" />
              <div className="h-3 bg-muted/30 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-muted/30 rounded w-full" />
                <div className="h-3 bg-muted/30 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
