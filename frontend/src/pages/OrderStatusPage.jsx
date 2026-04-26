import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderStatuses } from '../data/mockData';
import Button from '../components/Button';

export default function OrderStatusPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Simulate order progression
  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setCurrentStep(2), 3000));
    timers.push(setTimeout(() => setCurrentStep(3), 8000));
    timers.push(setTimeout(() => setCurrentStep(4), 14000));
    return () => timers.forEach(clearTimeout);
  }, []);

  const pickupTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 12);
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12">

      {/* Order number badge */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/5 text-[#d4ff00] text-sm font-bold mb-4">
          Order #21
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          {currentStep < 3 ? 'Hang tight!' : currentStep === 3 ? 'Your order is ready!' : 'Enjoy your meal!'}
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          {currentStep < 3
            ? 'Your order is being prepared with care.'
            : currentStep === 3
            ? 'Please collect your order from the counter.'
            : 'Thank you for using QueueLess!'}
        </p>
      </div>

      {/* Status Card */}
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 mb-8">

        {/* Steps */}
        <div className="space-y-1">
          {orderStatuses.map((status, i) => {
            const stepNum = status.id;
            const isDone = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            const isUpcoming = currentStep < stepNum;

            return (
              <div key={status.id}>
                <div className="flex items-center gap-4 py-4">
                  {/* Step indicator */}
                  <div
                    className={[
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500',
                      isDone
                        ? 'bg-[#d4ff00] text-black shadow-[0_0_20px_rgba(212,255,0,0.4)]'
                        : isActive
                        ? 'bg-[#d4ff00]/20 border-2 border-[#d4ff00] text-[#d4ff00]'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-600',
                    ].join(' ')}
                  >
                    {isDone ? '✓' : isActive ? (
                      <span className="animate-spin text-[10px]">◌</span>
                    ) : (
                      stepNum
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        'font-semibold text-sm transition-colors duration-300',
                        isDone || isActive ? 'text-white' : 'text-zinc-600',
                      ].join(' ')}
                    >
                      {status.label}
                    </p>
                    {status.time && (isDone || isActive) && (
                      <p className="text-xs text-zinc-600 mt-0.5">{status.time}</p>
                    )}
                  </div>

                  {/* Active pulse */}
                  {isActive && (
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#d4ff00] rounded-full animate-ping opacity-75" />
                      <span className="text-[#d4ff00] text-xs font-semibold">Live</span>
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {i < orderStatuses.length - 1 && (
                  <div className="ml-5 w-px h-4 bg-zinc-800" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pickup time */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">
            Estimated Pickup
          </p>
          <p className="text-2xl font-black text-[#d4ff00]">{pickupTime()}</p>
        </div>
        <div className="text-4xl">⏱</div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link to="/menu" className="w-full">
          <Button variant="outline" fullWidth size="lg">
            Order More
          </Button>
        </Link>
        <Link to="/" className="w-full">
          <Button fullWidth size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
