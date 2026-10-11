interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple';
  size?: 'sm' | 'md';
}

const colors = {
  blue: 'bg-brand-50 text-brand-700',
  green: 'bg-success-50 text-success-700',
  amber: 'bg-warning-50 text-warning-700',
  red: 'bg-danger-50 text-danger-700',
  slate: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-50 text-purple-700',
};

export default function Badge({ children, color = 'slate', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colors[color]} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
    >
      {children}
    </span>
  );
}
