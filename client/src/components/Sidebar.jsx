import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  MessageSquare, 
  Compass, 
  Bell, 
  Search, 
  PlusSquare, 
  Menu, 
  PlayCircle,
  Heart,
  Layout,
  Zap
} from 'lucide-react';
import SearchModal from './SearchModal';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const menuItems = [
    { icon: <Home size={28} />, label: 'Home', path: '/' },
    { icon: <Search size={28} />, label: 'Search', onClick: () => setIsSearchOpen(true) },
    { icon: <Compass size={28} />, label: 'Explore', path: '/feed' },
    { icon: <PlayCircle size={28} />, label: 'Reels', path: '/reels' },
    { icon: <MessageSquare size={28} />, label: 'Messages', path: '/messages' },
    { icon: <Heart size={28} />, label: 'Notifications', path: '/notifications' },
    { icon: <PlusSquare size={28} />, label: 'Create', onClick: () => {} },
    { 
      icon: (
        <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-300">
          <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="profile" className="w-full h-full object-cover" />
        </div>
      ), 
      label: 'Profile', 
      path: `/profile/${user?._id}` 
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="hidden md:flex w-20 lg:w-64 h-screen border-r border-gray-100 dark:border-slate-800 flex-col py-8 px-4 justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-[90] transition-all">
        <div className="space-y-10">
          <div className="px-3 mb-12 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200 dark:shadow-none">
               <Zap size={24} fill="white" />
            </div>
            <h1 className="text-2xl font-outfit font-black tracking-tight hidden lg:block bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              PULSE
            </h1>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={item.onClick || (() => navigate(item.path))}
                className={`flex items-center p-3.5 rounded-2xl cursor-pointer transition-all duration-300 group ${isActive(item.path) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 group-active:scale-95 ${isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {item.icon}
                </div>
                <span className={`ml-4 text-[15px] font-semibold hidden lg:block ${isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {item.label}
                </span>
                {isActive(item.path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 hidden lg:block" />}
              </div>
            ))}
          </nav>
        </div>

        <div className="relative">
          <div
            onClick={() => setShowMore(!showMore)}
            className="flex items-center p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-dark-800 group"
          >
            <Menu size={28} className="text-gray-700 dark:text-dark-400 group-hover:scale-110" />
            <span className="ml-4 text-base hidden lg:block dark:text-dark-400">More</span>
          </div>

          {showMore && (
            <div className="absolute bottom-16 left-0 w-64 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-700 p-2 z-50 animate-in fade-in slide-in-from-bottom-5">
              <button 
                onClick={logout}
                className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-xl text-red-500 font-medium transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Sidebar;
