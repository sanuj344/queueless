import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function LogoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-10 border-zinc-800 bg-zinc-900/60 backdrop-blur-2xl text-center space-y-8 animate-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl animate-pulse">
            🚪
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Confirm Logout</h2>
          <p className="text-zinc-500 text-sm">Are you sure you want to end your current session?</p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleLogout}
            className="w-full bg-red-500 text-white font-bold hover:bg-red-600 transition-all py-4 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.2)]"
          >
            Yes, Log Me Out
          </Button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 text-zinc-400 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </Card>
    </div>
  );
}
