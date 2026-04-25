import { BrandedSpinner } from '@/components/shared/BrandedSpinner';

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-24" role="status" aria-label="Loading">
      <BrandedSpinner />
    </div>
  );
}
