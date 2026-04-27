export default function QuantityStepper({ quantity, onIncrement, onDecrement, size = 'md' }) {
  const btnClass =
    size === 'sm'
      ? 'w-6 h-6 text-xs rounded-lg'
      : 'w-8 h-8 text-sm rounded-xl';

  const countClass = size === 'sm' ? 'w-6 text-xs' : 'w-8 text-sm';

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onDecrement}
        className={[
          btnClass,
          'flex items-center justify-center',
          'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white',
          'transition-colors font-bold',
        ].join(' ')}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={[countClass, 'text-center font-semibold text-zinc-900 dark:text-white tabular-nums'].join(
          ' '
        )}
      >
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className={[
          btnClass,
          'flex items-center justify-center',
          'bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black hover:bg-[#7a9e00] dark:hover:bg-[#c0e600]',
          'transition-colors font-bold',
        ].join(' ')}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
