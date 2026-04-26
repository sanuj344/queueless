import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full bg-zinc-700 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00]/50"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center text-[10px]',
          isDark
            ? 'translate-x-6 bg-[#d4ff00] shadow-[0_0_8px_#d4ff00]'
            : 'translate-x-0 bg-amber-400',
        ].join(' ')}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
