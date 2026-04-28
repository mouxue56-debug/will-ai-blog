interface SectionAccentLineProps {
  className?: string;
}

export function SectionAccentLine({ className = '' }: SectionAccentLineProps) {
  return (
    <div className={`w-16 h-0.5 bg-gradient-to-r from-[#00D4FF] to-transparent mb-6 ${className}`} />
  );
}
