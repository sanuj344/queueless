import Modal from './Modal';
import Button from './Button';

export default function VendorInstructionsModal({ isOpen, onClose }) {
  const instructions = [
    {
      icon: '📦',
      title: 'Item Selection',
      desc: 'Add only items with longer shelf life to minimize wastage.'
    },
    {
      icon: '🔄',
      title: 'Maintain Backup',
      desc: 'Always keep backup stock for high-demand items.'
    },
    {
      icon: '🚫',
      title: 'Avoid Cancellations',
      desc: 'Frequent cancellations affect your stall rating and visibility.'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vendor Guidelines" size="md">
      <div className="space-y-6 py-2">
        <div className="bg-[#d4ff00]/5 border border-[#d4ff00]/10 rounded-2xl p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Welcome to <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">Qzaam</span>! Please follow these guidelines to provide the best experience to your customers.
          </p>
        </div>

        <div className="grid gap-4">
          {instructions.map((item, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#d4ff00]/30 transition-colors">
              <div className="w-12 h-12 shrink-0 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl shadow-sm">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button fullWidth size="lg" onClick={onClose}>
            Got it, Let's go!
          </Button>
        </div>
      </div>
    </Modal>
  );
}
