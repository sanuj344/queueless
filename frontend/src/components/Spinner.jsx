export default function Spinner({ size = 'md', color = 'primary' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    primary: 'border-[#d4ff00]/20 border-t-[#d4ff00]',
    white: 'border-white/20 border-t-white',
    zinc: 'border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 animate-pulse">
        Processing
      </p>
    </div>
  );
}
