import { Menu, LogOut } from 'lucide-react';
import VirtualAssistantLogo from '../assets/VirtualAssistantLogo.jpg';
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clear token + user
    navigate('/login'); // redirect to login page
  };
  return (
    <header className="fixed top-0 left-0 z-40 w-full border-b border-primary-100 bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button onClick={onMenuClick} className="lg:hidden rounded-md p-2 hover:bg-gray-100">
            <Menu size={22} />
          </button>

          <img src={VirtualAssistantLogo} className="h-8 w-auto" />
          <h1 className="text-lg lg:text-xl font-bold">Virtual Assistant</h1>
        </div>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-6">
          {/* <span className="text-sm cursor-pointer">Help</span>
          <span className="text-sm cursor-pointer">Settings</span> */}

          <div className="h-6 w-px bg-gray-200" />

          <span className="text-sm font-medium">Super Admin</span>

          {/* <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
            className="h-9 w-9 rounded-full"
          /> */}

          <button
            onClick={handleLogout}
            className="h-10 w-10 rounded-full border border-primary-100 hover:bg-gray-100 flex items-center justify-center transition-all duration-300 ease-in-out
    hover:bg-red-50 hover:border-red-400
    hover:rotate-12 hover:scale-110
    active:scale-95
    group"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
