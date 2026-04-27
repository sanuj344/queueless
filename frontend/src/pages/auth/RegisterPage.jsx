import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  
  const [role, setRole] = useState(searchParams.get('vendor') === 'true' ? 'vendor' : 'customer');
  const [formData, setFormData] = useState({
    name: '',
    outletName: '',
    email: '',
    password: '',
    mobile: '',
    address: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Extracted clean validations
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      setError('Mobile number must be exactly 10 digits.');
      setIsLoading(false);
      return;
    }

    if (role === 'vendor') {
      if (!formData.outletName.trim() || !formData.address.trim()) {
        setError('Vendor accounts require an Outlet Name and Address.');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      await register(formData, role);
      setSuccessMsg(`Your ${role} account was securely created! Redirecting to login...`);
      setTimeout(() => navigate('/auth'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-xl">
                {successMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {role === 'vendor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Outlet Name (Business)
                  </label>
                  <div className="mt-1">
                    <input
                      name="outletName"
                      type="text"
                      required={role === 'vendor'}
                      value={formData.outletName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Business Address
                  </label>
                  <div className="mt-1">
                    <input
                      name="address"
                      type="text"
                      required={role === 'vendor'}
                      value={formData.address}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mobile Number
              </label>
              <div className="mt-1">
                <input
                  name="mobile"
                  type="tel"
                  maxLength="10"
                  pattern="\d{10}"
                  title="Mobile number must be exactly 10 digits"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                I am registering as a
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={role === 'customer'}
                    onChange={() => setRole('customer')}
                    className="accent-[#8cb800] dark:accent-[#d4ff00]"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Customer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="vendor"
                    checked={role === 'vendor'}
                    onChange={() => setRole('vendor')}
                    className="accent-[#8cb800] dark:accent-[#d4ff00]"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Vendor</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <Button type="submit" fullWidth disabled={isLoading || !!successMsg}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Already have an account? </span>
              <Link to="/auth" className="font-medium text-[#8cb800] dark:text-[#d4ff00] hover:text-[#7a9e00] dark:hover:text-[#c0e600]">
                Sign in
              </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
