import { BrandedSpinner } from '@/components/shared/BrandedSpinner';

// Minimal breathing placeholder — avoids the card-grid flash on non-list pages.
// Route-specific loading.tsx files provide tailored skeletons where it matters
// (see src/app/[locale]/blog/loading.tsx).
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-24">
      <BrandedSpinner />
    </div>
  );
}
