export default function Card({ children, className = '', hover = false, onClick }) {
  const base =
    'rounded-2xl border bg-zinc-900 border-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 ' +
    'light:bg-white light:border-zinc-200';

  return (
    <div
      onClick={onClick}
      className={[
        base,
        hover
          ? 'transition-all duration-200 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 cursor-pointer'
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
