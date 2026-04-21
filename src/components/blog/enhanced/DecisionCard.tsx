'use client';

interface DecisionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'success';
}

export function DecisionCard({ title, icon, children, variant = 'default' }: DecisionCardProps) {
  const variantStyles = {
    default: 'border-cyan-500/20 hover:border-cyan-400/40 bg-gradient-to-br from-slate-900/50 to-slate-800/50',
    warning: 'border-amber-500/20 hover:border-amber-400/40 bg-gradient-to-br from-amber-900/20 to-slate-800/50',
    success: 'border-emerald-500/20 hover:border-emerald-400/40 bg-gradient-to-br from-emerald-900/20 to-slate-800/50'
  };

  return (
    <div className={`my-6 p-5 rounded-xl border transition-all duration-200 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h4 className="font-semibold text-slate-100">{title}</h4>
      </div>
      <div className="text-slate-300 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function DecisionPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider min-w-[80px]">
        {label}
      </span>
      <span className="text-sm text-slate-300 flex-1">{value}</span>
    </div>
  );
}
