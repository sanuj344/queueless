export default function Card({ children, className = '', hover = false, onClick }) {
  const base =
    'rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800';

  return (
    <div
      onClick={onClick}
      className={[
        base,
        hover
          ? 'transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 cursor-pointer'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
