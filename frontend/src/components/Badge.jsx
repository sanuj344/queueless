const variants = {
  neon: 'bg-[#8cb800]/15 dark:bg-[#d4ff00]/15 text-[#8cb800] dark:text-[#d4ff00] border border-[#8cb800]/25 dark:border-[#d4ff00]/25',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
  red: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25',
  zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700',
  orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25',
};

export default function Badge({ children, variant = 'zinc', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
        variants[variant] ?? variants.zinc,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
