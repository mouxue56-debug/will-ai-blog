// Article detail skeleton — matches BlogDetail layout closer than the generic grid.
export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 animate-pulse">
      <div className="h-4 w-20 bg-muted/50 rounded mb-6" />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-12">
        <div className="min-w-0 max-w-4xl">
          {/* Cover image area */}
          <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-8 max-w-3xl mx-auto bg-muted/40" />

          {/* Meta row */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted/50" />
              <div className="h-6 w-16 rounded-full bg-muted/50" />
            </div>
            <div className="h-10 bg-muted/60 rounded-lg w-4/5" />
            <div className="h-4 bg-muted/40 rounded w-1/2" />
          </div>

          {/* Article body */}
          <div className="glass-card p-8 sm:p-10 space-y-4">
            <div className="h-6 bg-muted/50 rounded w-1/3" />
            <div className="h-4 bg-muted/30 rounded w-full" />
            <div className="h-4 bg-muted/30 rounded w-11/12" />
            <div className="h-4 bg-muted/30 rounded w-10/12" />
            <div className="h-4 bg-muted/30 rounded w-full" />
            <div className="h-6 bg-muted/50 rounded w-1/4 mt-8" />
            <div className="h-4 bg-muted/30 rounded w-full" />
            <div className="h-4 bg-muted/30 rounded w-11/12" />
          </div>
        </div>

        {/* TOC aside */}
        <aside className="hidden xl:block xl:sticky xl:top-24 mt-0">
          <div className="space-y-3 rounded-xl border border-border/30 p-4">
            <div className="h-4 bg-muted/50 rounded w-1/2" />
            <div className="h-3 bg-muted/30 rounded w-3/4" />
            <div className="h-3 bg-muted/30 rounded w-2/3" />
            <div className="h-3 bg-muted/30 rounded w-4/5" />
            <div className="h-3 bg-muted/30 rounded w-3/5" />
          </div>
        </aside>
      </div>
    </div>
  );
}
