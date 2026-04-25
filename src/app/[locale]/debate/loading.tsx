// Debate list skeleton — matches the debate page banner + masonry card layout.
export default function DebateLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 animate-pulse">
      {/* Banner skeleton */}
      <div className="glass-card mb-6 overflow-hidden rounded-3xl">
        <div className="relative h-40 sm:h-48 bg-muted/40">
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 gap-3">
            <div className="h-9 bg-muted/60 rounded-lg w-48" />
            <div className="h-4 bg-muted/40 rounded-lg w-72" />
          </div>
        </div>
      </div>

      {/* Guide skeleton */}
      <div className="h-10 bg-muted/30 rounded-xl w-full max-w-md mx-auto mb-6" />

      {/* Card grid skeleton */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid rounded-xl border border-border/30 bg-card/50 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 rounded-full bg-muted/50" />
                <div className="h-4 w-24 bg-muted/40 rounded" />
              </div>
              <div className="h-5 bg-muted/50 rounded w-4/5" />
              <div className="space-y-2">
                <div className="h-3 bg-muted/30 rounded w-full" />
                <div className="h-3 bg-muted/30 rounded w-11/12" />
                <div className="h-3 bg-muted/30 rounded w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
