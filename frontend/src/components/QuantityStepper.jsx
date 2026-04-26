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
          'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white',
          'transition-colors font-bold',
        ].join(' ')}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={[countClass, 'text-center font-semibold text-white tabular-nums'].join(
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
          'bg-[#d4ff00] text-black hover:bg-[#c0e600]',
          'transition-colors font-bold',
        ].join(' ')}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
