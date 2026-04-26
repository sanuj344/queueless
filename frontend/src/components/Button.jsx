import React from 'react';

const variants = {
  primary:
    'bg-[#d4ff00] text-black hover:bg-[#c0e600] focus-visible:ring-[#d4ff00]/50 font-bold',
  secondary:
    'bg-transparent border border-[#d4ff00] text-[#d4ff00] hover:bg-[#d4ff00]/10 focus-visible:ring-[#d4ff00]/30 font-semibold',
  ghost:
    'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus-visible:ring-white/20',
  danger:
    'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 focus-visible:ring-red-500/30',
  outline:
    'bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white focus-visible:ring-white/20',
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
