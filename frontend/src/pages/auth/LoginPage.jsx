import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import AdminLoginModal from '../../components/AdminLoginModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleAdminLogin = () => {
    setError('');
    setIsAdminModalOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    navigate('/admin/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'vendor') navigate('/vendor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
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
          Sign in to your account
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

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="pt-2">
              <Button 
                variant="outline" 
                fullWidth 
                onClick={handleAdminLogin}
                className="border-[#8cb800] dark:border-[#d4ff00] text-[#8cb800] dark:text-[#d4ff00] hover:bg-[#8cb800]/10 dark:hover:bg-[#d4ff00]/10"
              >
                Login as Admin
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Don't have an account? </span>
              <Link to="/auth/register" className="font-medium text-[#8cb800] dark:text-[#d4ff00] hover:text-[#7a9e00] dark:hover:text-[#c0e600]">
                Register
              </Link>
          </div>
        </Card>
      </div>
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
