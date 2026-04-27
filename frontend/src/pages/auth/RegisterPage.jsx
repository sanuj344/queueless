import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVendor = searchParams.get('vendor') === 'true';
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const role = isVendor ? 'vendor' : 'customer';
    register(formData, role);
    if (role === 'customer') navigate('/menu');
    else if (role === 'vendor') navigate('/vendor/dashboard');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Create a {isVendor ? 'Vendor' : 'Customer'} account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name {isVendor && '(or Outlet Name)'}
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
                  required
                  value={formData.mobile}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800] dark:focus:border-[#d4ff00] sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <Button type="submit" fullWidth>
              Register
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
