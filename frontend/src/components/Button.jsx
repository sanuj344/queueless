import React from 'react';

const variants = {
  primary:
    'bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black hover:bg-[#7a9e00] dark:hover:bg-[#c0e600] focus-visible:ring-[#8cb800]/50 dark:focus-visible:ring-[#d4ff00]/50 font-bold',
  secondary:
    'bg-transparent border border-[#8cb800] dark:border-[#d4ff00] text-[#8cb800] dark:text-[#d4ff00] hover:bg-[#8cb800]/10 dark:hover:bg-[#d4ff00]/10 focus-visible:ring-[#8cb800]/30 dark:focus-visible:ring-[#d4ff00]/30 font-semibold',
  ghost:
    'bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-black/20 dark:focus-visible:ring-white/20',
  danger:
    'bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 focus-visible:ring-red-500/30',
  outline:
    'bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white focus-visible:ring-black/20 dark:focus-visible:ring-white/20',
};

const sizes = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:scale-[0.97]',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
