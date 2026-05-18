import { Link, useNavigate } from 'react-router-dom';

import { features, vendorSteps } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';

import Card from '../components/Card';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBecomeVendorClick = () => {
    if (user?.role === 'vendor') {
      toast.success('Already logged in as vendor!');
      navigate('/vendor/dashboard');
    } else {
      navigate('/auth/register?vendor=true');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white overflow-x-hidden transition-colors duration-300">


      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center pt-24">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4ff00]/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#d4ff00]/3 rounded-full blur-3xl" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/5 text-[#d4ff00] text-xs font-semibold tracking-wider uppercase mb-8">
          <span className="w-1.5 h-1.5 bg-[#d4ff00] rounded-full animate-pulse" />
          QR-Based Ordering — No App Needed
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6">
          <span className="block text-zinc-900 dark:text-white">SCAN.</span>
          <span className="block text-zinc-900 dark:text-white">ORDER.</span>
          <span className="block text-[#8cb800] dark:text-[#d4ff00]">SKIP.</span>
        </h1>

        <p className="max-w-xl text-zinc-600 dark:text-zinc-400 text-base sm:text-lg md:text-xl leading-relaxed mb-10">
          Qzaam turns any table into a smart order point. No paper menus.
          No waiting. Just scan and go.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {user?.role === 'admin' ? (
            <Link to="/admin/dashboard" className="w-full sm:w-auto">
              <Button size="xl" fullWidth>
                Go to Dashboard →
              </Button>
            </Link>
          ) : user?.role === 'vendor' ? (
            <Link to="/vendor/dashboard" className="w-full sm:w-auto">
              <Button size="xl" fullWidth>
                Go to Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/menu" className="w-full sm:w-auto">
                <Button size="xl" fullWidth>
                  Get Started Now →
                </Button>
              </Link>
              <button onClick={handleBecomeVendorClick} className="w-full sm:w-auto">
                <Button variant="secondary" size="xl" fullWidth>
                  Vendor Onboarding
                </Button>
              </button>
            </>
          )}

        </div>


        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-400 dark:text-zinc-600 text-xs flex flex-col items-center gap-2">
          <span>Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-400 dark:from-zinc-600 to-transparent" />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Label */}
        <p className="text-xs font-semibold text-[#8cb800] dark:text-[#d4ff00] tracking-[0.2em] uppercase text-center mb-4">
          Why Qzaam
        </p>
        <h2 className="text-3xl sm:text-5xl font-black text-center tracking-tight mb-4 text-zinc-900 dark:text-white">
          Built for speed.{' '}
          <span className="text-zinc-500 dark:text-zinc-500">Designed to delight.</span>
        </h2>
        <p className="text-zinc-500 dark:text-zinc-500 text-center max-w-xl mx-auto mb-16">
          Every feature exists to remove friction between your customer and
          their food.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Card
              key={i}
              hover
              className="p-8 group transition-all duration-300 hover:border-[#d4ff00]/30 hover:shadow-[0_0_40px_rgba(212,255,0,0.05)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#d4ff00]/10 border border-[#d4ff00]/20 flex items-center justify-center text-2xl mb-6 group-hover:bg-[#d4ff00]/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed">
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── VENDOR STEPS ─── */}
      <section id="vendor" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div>
              <p className="text-xs font-semibold text-[#8cb800] dark:text-[#d4ff00] tracking-[0.2em] uppercase mb-4">
                For Vendors
              </p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-6 text-zinc-900 dark:text-white">
                Go digital in{' '}
                <span className="text-[#8cb800] dark:text-[#d4ff00]">3 simple steps.</span>
              </h2>
              <p className="text-zinc-600 dark:text-zinc-500 leading-relaxed mb-10">
                No technical know-how required. Set up your outlet, generate
                your QR, and start taking orders within the hour.
              </p>
              {user?.role !== 'vendor' && user?.role !== 'admin' && (
                <Link to="/menu">
                  <Button size="lg">See Live Demo →</Button>
                </Link>
              )}
            </div>

            {/* Right steps */}
            <div className="space-y-5">
              {vendorSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-6 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                >
                  <span className="text-4xl font-black text-zinc-200 dark:text-zinc-800 group-hover:text-[#8cb800]/30 dark:group-hover:text-[#d4ff00]/30 transition-colors tabular-nums shrink-0">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center rounded-3xl border border-[#d4ff00]/20 bg-[#d4ff00]/5 p-12 sm:p-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4ff00]/8 rounded-full blur-3xl" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 relative text-zinc-900 dark:text-white">
            Ready to skip the queue?
          </h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-10 max-w-md mx-auto relative">
            Join thousands of restaurants already using Qzaam to serve
            faster and smarter.
          </p>
          {user?.role !== 'vendor' && user?.role !== 'admin' && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <Link to="/menu">
                <Button size="xl">Try It Now — Free</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
