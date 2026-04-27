import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, role);
    if (role === 'customer') navigate('/menu');
    else if (role === 'vendor') navigate('/vendor/dashboard');
  };

  const handleAdminLogin = () => {
    loginAsAdmin();
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                I am a
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

            <Button type="submit" fullWidth>
              Sign in
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500">
                  Or continue as
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleAdminLogin} variant="outline" fullWidth>
                Login as Admin
              </Button>
            </div>
            
            <div className="mt-6 text-center text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Don't have an account? </span>
                <Link to={`/auth/register${role === 'vendor' ? '?vendor=true' : ''}`} className="font-medium text-[#8cb800] dark:text-[#d4ff00] hover:text-[#7a9e00] dark:hover:text-[#c0e600]">
                  Register
                </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
