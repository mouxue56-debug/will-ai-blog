// Minimal breathing placeholder — avoids the card-grid flash on non-list pages.
// Route-specific loading.tsx files provide tailored skeletons where it matters
// (see src/app/[locale]/blog/loading.tsx).
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-24 flex items-center justify-center">
      <div
        aria-label="Loading"
        className="relative h-10 w-10"
        style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.35))' }}
      >
        <span
          className="absolute inset-0 rounded-full border border-brand-cyan/40 animate-ping"
          style={{ animationDuration: '1.8s' }}
        />
        <span
          className="absolute inset-[6px] rounded-full bg-gradient-to-br from-brand-mint/60 to-brand-cyan/60"
          style={{ animation: 'pulse 2.2s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}
